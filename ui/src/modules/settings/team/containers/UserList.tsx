import client from 'apolloClient';
import gql from 'graphql-tag';
import { IButtonMutateProps } from 'modules/common/types';
import { Alert } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import {
  ICommonFormProps,
  ICommonListProps
} from 'modules/settings/common/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import UserList from '../components/UserList';
import { mutations, queries } from '../graphql';

type Props = ICommonListProps &
  ICommonFormProps & {
    statusChangedMutation: any;
    listQuery: any;
    renderButton: (props: IButtonMutateProps) => JSX.Element;
  };

class UserListContainer extends React.Component<Props> {
  changeStatus = (id: string): void => {
    const { statusChangedMutation, listQuery } = this.props;

    statusChangedMutation({
      variables: { _id: id }
    })
      .then(() => {
        listQuery.refetch();

        Alert.success('Congrats, Successfully updated.');
      })
      .catch((error: Error) => {
        Alert.error(error.message);
      });
  };

  resendInvitation(email: string) {
    client
      .mutate({
        mutation: gql(mutations.usersResendInvitation),
        variables: { email }
      })
      .then(() => {
        Alert.success('Successfully resent the invitation');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  }

  render() {
    return (
      <UserList
        {...this.props}
        changeStatus={this.changeStatus}
        resendInvitation={this.resendInvitation}
        renderButton={this.props.renderButton}
      />
    );
  }
}

export const options = ({ queryParams }: { queryParams: any }): any => {
  return {
    variables: {
      ...generatePaginationParams(queryParams),
      searchValue: queryParams.searchValue,
      isActive: queryParams.isActive === 'false' ? false : true,
      brandIds: queryParams.brandIds
    },
    fetchPolicy: 'network-only'
  };
};

export default commonListComposer<{ queryParams: any; history: any }>({
  text: 'team member',
  label: 'users',
  stringAddMutation: mutations.usersInvite,
  stringEditMutation: mutations.usersEdit,

  gqlListQuery: graphql(gql(queries.users), {
    name: 'listQuery',
    options
  }),
  gqlAddMutation: graphql(gql(mutations.usersInvite), {
    name: 'addMutation'
  }),
  gqlEditMutation: graphql(gql(mutations.usersEdit), {
    name: 'editMutation'
  }),
  gqlRemoveMutation: graphql<{ queryParams: any }>(
    gql(mutations.usersSetActiveStatus),
    {
      name: 'statusChangedMutation',
      options: ({ queryParams }) => ({
        refetchQueries: [
          {
            query: gql(queries.users),
            variables: {
              ...generatePaginationParams(queryParams),
              isActive: !(queryParams.isActive === 'false' ? false : true)
            }
          }
        ]
      })
    }
  ),
  gqlTotalCountQuery: graphql(gql(queries.usersTotalCount), {
    name: 'totalCountQuery',
    options
  }),
  ListComponent: UserListContainer
});
