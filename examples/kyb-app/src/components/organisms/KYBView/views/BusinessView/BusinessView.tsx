import { DynamicForm } from '@app/common/components/organisms/DynamicForm';
import { useViewState } from '@app/common/providers/ViewStateProvider';
import { AppShell } from '@app/components/layouts/AppShell';
import { BusinessInformationContext, KYBContext } from '@app/components/organisms/KYBView/types';
import { formSchema } from './form.schema';
import { useCallback } from 'react';

export const BusinessView = () => {
  const { context, state, saveAndPerformTransition } = useViewState<KYBContext>();

  const handleSubmit = useCallback(
    (values: BusinessInformationContext) => {
      void saveAndPerformTransition(values);
    },
    [saveAndPerformTransition],
  );

  return (
    <AppShell.FormContainer>
      <DynamicForm<BusinessInformationContext>
        className="max-w-[384px]"
        schema={formSchema}
        formData={context[state] as BusinessInformationContext}
        onSubmit={handleSubmit}
      />
    </AppShell.FormContainer>
  );
};
