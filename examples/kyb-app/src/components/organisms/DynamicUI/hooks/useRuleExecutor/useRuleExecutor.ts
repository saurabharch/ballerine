import { EngineManager } from '@app/components/organisms/DynamicUI/StateManager/components/ActionsHandler/helpers/engine-manager';
import { UIState } from '@app/components/organisms/DynamicUI/hooks/useUIStateLogic/types';
import {
  JsonLogicRuleEngine,
  RuleTestResult,
} from '@app/components/organisms/DynamicUI/rule-engines';
import { JsonSchemaRuleEngine } from '@app/components/organisms/DynamicUI/rule-engines/json-schema.rule-engine';
import { Rule, UIElement } from '@app/domains/collection-flow';
import { AnyObject } from '@ballerine/ui';
import { useEffect, useMemo, useState } from 'react';
import { JmespathRuleEngine } from '@app/components/organisms/DynamicUI/rule-engines/jmespath.rule-engine';

export const useRuleExecutor = (
  context: AnyObject,
  rules: Rule[],
  definition: UIElement<AnyObject>,
  uiState: UIState,
) => {
  const [executionResult, setExecutionResult] = useState<RuleTestResult[]>([]);

  const rulesManager = useMemo(
    () =>
      new EngineManager([
        new JsonLogicRuleEngine(),
        new JsonSchemaRuleEngine(),
        new JmespathRuleEngine(),
      ]),
    [],
  );

  const executeRules = useMemo(
    () =>
      (context: AnyObject, rules: Rule[], definition: UIElement<AnyObject>, uiState: UIState) => {
        const executionResult =
          rules?.map(rule => {
            const engine = rulesManager.getEngine(rule.type);

            return engine.test(context, rule, definition, uiState);
          }) || [];

        setExecutionResult(executionResult);
      },
    [rulesManager],
  );

  useEffect(() => {
    executeRules(context, rules, definition, uiState);
  }, [context, rules, definition, uiState, executeRules]);

  console.log('rule results', executionResult);

  return executionResult;
};
