import * as React from 'react';
import {
  Button,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useGetProductById} from '../api/product';
import QuantityToggler from '../components/quantity-toggler';
import ScreenLoading from '../components/screen-loading';
import Spacing from '../components/spacing';
import useRefreshByUser from '../hooks/useRefreshByUser';
import {RouteNames} from '../navigation/route-names';
import {ProductDetailScreenProps} from '../navigation/types';
import {useProductActions, useProductQuantity} from '../store/product';
import {COMMON_STYLES} from '../theme/common-styles';
import {cutString} from '../utils/cut-string';
import {getWindowHeight, getWindowWidth} from '../utils/layout';

const VERTICAL_SPACING = 24;
type Props = ProductDetailScreenProps;

const ProductDetail: React.FC<Props> = ({navigation, route}) => {
  const {data, isLoading, refetch} = useGetProductById(route.params.id);

  const {isRefetchingByUser, refetchByUser} = useRefreshByUser(refetch);

  const {
    increaseFavoritedProductQuantity,
    decreaseFavoritedProductQuantity,
    addFavoriteProduct,
    removeFavoritedProduct,
  } = useProductActions();

  const productQuantity = useProductQuantity(data?.id);

  React.useEffect(() => {
    if (data?.title) {
      navigation.setOptions({
        headerTitle: cutString(data?.title),
      });
    }
  }, [data?.title, navigation]);

  if (isLoading) {
    return <ScreenLoading />;
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <ScrollView
        testID="product-detail-scroll-view"
        refreshControl={
          <RefreshControl
            refreshing={isRefetchingByUser}
            onRefresh={refetchByUser}
          />
        }
        contentContainerStyle={styles.contentContainerStyle}
        showsVerticalScrollIndicator={false}
        style={COMMON_STYLES.flex}>
        <Spacing height={8} />

        <Image
          style={styles.image}
          resizeMode="contain"
          source={{uri: data?.image}}
        />

        <Spacing height={VERTICAL_SPACING} />

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{data?.title}</Text>

          <Spacing height={VERTICAL_SPACING} />

          <View style={styles.quantityTogglerContainer}>
            <Text style={styles.infoText}>{`$ ${data?.price}`}</Text>
            <QuantityToggler
              style={styles.quantityToggler}
              quantity={productQuantity ?? 0}
              onIncreaseQuantityPress={() => {
                if (data?.id) {
                  // item has not been added to basket yet
                  if (typeof productQuantity === 'undefined') {
                    addFavoriteProduct(data);
                  } else {
                    increaseFavoritedProductQuantity(data.id);
                  }
                }
              }}
              onDecreaseQuantityPress={() => {
                if (data?.id) {
                  // item has quantity of 1, means its time to remove the item from the basket
                  if (productQuantity === 1) {
                    removeFavoritedProduct(data.id);
                  } else {
                    decreaseFavoritedProductQuantity(data.id);
                  }
                }
              }}
            />
          </View>

          <Spacing height={VERTICAL_SPACING} />

          <Text style={styles.infoText}>{data?.description}</Text>
        </View>
      </ScrollView>

      <Button
        color={'darkslateblue'}
        title="Go to basket"
        onPress={() => navigation.navigate(RouteNames.basket)}
      />
    </SafeAreaView>
  );
};

export default ProductDetail;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainerStyle: {
    flexGrow: 1,
    paddingVertical: COMMON_STYLES.screenPadding,
    backgroundColor: '#fff',
  },
  image: {
    justifyContent: 'flex-end',
    backgroundColor: '#fff',
    width: getWindowWidth(100),
    height: getWindowHeight(25),
  },
  infoContainer: {
    borderTopWidth: 1,
    paddingHorizontal: COMMON_STYLES.screenPadding,
    paddingTop: COMMON_STYLES.screenPadding,
    borderColor: '#e2e2e2',
  },
  infoText: {
    fontSize: 16,
  },
  title: {
    fontSize: 20,
  },
  quantityTogglerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityToggler: {
    flex: 0.5,
  },
});
