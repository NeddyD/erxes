import gql from 'graphql-tag';
import TaggerSection from '@erxes/ui-contacts/src/customers/components/common/TaggerSection';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import BasicInfo from '../../../containers/product/detail/BasicInfo';
import CustomFieldsSection from '../../../containers/product/detail/CustomFieldsSection';
import { IProduct } from '../../../types';
import React from 'react';
import { queries } from '../../../graphql';

type Props = {
  product: IProduct;
};

class LeftSidebar extends React.Component<Props> {
  render() {
    const { product } = this.props;

    const refetchQueries = [
      {
        query: gql(queries.productDetail),
        variables: { _id: product._id }
      }
    ];

    return (
      <Sidebar wide={true}>
        <BasicInfo product={product} refetchQueries={refetchQueries} />
        <CustomFieldsSection product={product} />
        <TaggerSection
          data={product}
          type='product'
          refetchQueries={refetchQueries}
        />
      </Sidebar>
    );
  }
}

export default LeftSidebar;
