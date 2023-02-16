import { useEffect } from 'react';
import { useFirstEndUserIdQuery } from '../../lib/react-query/queries/useFirstEndUserIdQuery/useFirstEndUserIdQuery';
import { individualsRoute } from 'components/pages/Individuals/Individuals.route';
import { useSelectEndUser } from 'hooks/useSelectEndUser/useSelectEndUser';
import { useParams } from '@tanstack/react-router';
import { env } from '../../env/env';
import { useEndUsersQuery } from '../../lib/react-query/queries/useEndUsersQuery/useEndUsersQuery';

/**
 * @description Sets the selected end user to the first end user in the array on mount if no user is currently selected. Returns the select end user handler.
 */
export const useSelectEndUserOnMount = () => {
  const { endUserId } = useParams();
  const { data: endUsers } = useEndUsersQuery();
  const { data: firstEndUserId } = useFirstEndUserIdQuery({
    initialState: {
      sortBy: 'createdAt',
    },
    routeId: individualsRoute.id,
  });
  const onSelectEndUser = useSelectEndUser();
  const userExists = endUsers?.some(({ id }) => endUserId === id);
  // Otherwise open to a race condition where
  // the current end user id no longer exists
  // in the in-memory mock data.
  const shouldReturn = env.VITE_MOCK_SERVER
    ? endUserId && userExists
    : endUserId;
  const deps = env.VITE_MOCK_SERVER ? [shouldReturn] : [];

  useEffect(() => {
    if (!firstEndUserId || shouldReturn) return;

    onSelectEndUser(firstEndUserId)();
  }, deps);
};
