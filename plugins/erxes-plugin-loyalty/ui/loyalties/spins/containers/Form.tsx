import * as compose from 'lodash.flowright';
import Form from '../components/Form';
import React from 'react';
import { ButtonMutate, withProps } from 'erxes-ui';
import { IButtonMutateProps, IQueryParams } from 'erxes-ui/lib/types';
import { ISpin } from '../types';
import { IUser } from 'erxes-ui/lib/auth/types';
import { mutations } from '../graphql';
import { UsersQueryResponse } from 'erxes-ui/lib/auth/types';

type Props = {
  spin: ISpin;
  getAssociatedSpin?: (spinId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
  queryParams: IQueryParams;
} & Props;

class SpinFromContainer extends React.Component<FinalProps> {
  render() {
    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal, getAssociatedSpin } = this.props;

      const afterSave = data => {
        closeModal();

        if (getAssociatedSpin) {
          getAssociatedSpin(data.spinsAdd);
        }
      };

      return (
        <ButtonMutate
          mutation={object ? mutations.spinsEdit : mutations.spinsAdd}
          variables={values}
          callback={afterSave}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully ${object ? 'updated' : 'added'
            } a ${name}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      renderButton,
    };
    return <Form {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return [
    'spinsMain',
    'spinDetail',
    // spins for customer detail spin associate
    'spins',
    'spinCounts',
    'spinCompaigns',
    'spinCompaignsTotalCount'
  ];
};

export default withProps<Props>(
  compose(
  )(SpinFromContainer)
);
