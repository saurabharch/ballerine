import { StateMachineAPI } from '@app/components/organisms/DynamicUI/StateManager/hooks/useMachineLogic';
import { useCallback, useEffect, useState } from 'react';
import { Action } from '@app/domains/collection-flow';
import { ActionHandlerManager } from '@app/components/organisms/DynamicUI/StateManager/components/ActionsHandler/hooks/useActionsHandlerLogic/hooks/helpers/action-handler-manager';
import { ApiActionHandler } from '@app/components/organisms/DynamicUI/StateManager/components/ActionsHandler/action-handlers/api.handler';
import { EventDispatcherHandler } from '@app/components/organisms/DynamicUI/StateManager/components/ActionsHandler/action-handlers/event-dispatcher.handler';
import { PluginRunnerHandler } from '@app/components/organisms/DynamicUI/StateManager/components/ActionsHandler/action-handlers/plugin-runner.handler';

const defaultActionHandlers = [
  new ApiActionHandler(),
  new EventDispatcherHandler(),
  new PluginRunnerHandler(),
];

export const useActionsHandlerLogic = (
  stateApi: StateMachineAPI,
  actionHandlers = defaultActionHandlers,
) => {
  const [pendingActions, setPendingActions] = useState<Action[]>([]);
  const [isProcessingActions, setProcessingActions] = useState(false);

  console.log({ pendingActions });

  const dispatchAction = useCallback((action: Action) => {
    setPendingActions(prev => [...prev, action]);
  }, []);

  const processActions = useCallback(
    async (actions: Action[]) => {
      try {
        setProcessingActions(true);

        const actionHandlerManager = new ActionHandlerManager(actionHandlers);
        let context = stateApi.getContext();

        for (const action of actions) {
          const actionHandler = actionHandlerManager.getActionHandler(action.type);
          if (!actionHandler) throw new Error(`Action ${action.type} is not supported`);

          context = await actionHandler.run(context, action, stateApi);
        }

        stateApi.setContext(context);
      } catch (error) {
        console.log('error', error);
        console.log('Failed to perform action ', error.message);
      } finally {
        setPendingActions([]);
        setProcessingActions(false);
      }
    },
    [actionHandlers, stateApi],
  );

  useEffect(() => {
    if (!pendingActions.length || isProcessingActions) return;

    void processActions(pendingActions);
  }, [pendingActions, isProcessingActions, processActions]);
  // loop for

  return {
    dispatchAction,
  };
};
