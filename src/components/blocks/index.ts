import Entry from '@components/blocks/Entry';
import Grid from '@components/blocks/Grid';
import Hero from '@components/blocks/Hero';
import ShoplabProducts from '@components/blocks/ShoplabProducts';
import Usp from '@components/blocks/Usp';
import { type SbReactComponentsMap } from '@storyblok/react';
import Banner from '@/src/components/blocks/Banner/Banner';
import BannerGrid from '@/src/components/blocks/Banner/BannerGrid';
import CmsPageHeader from '@/src/components/blocks/CmsPageHeader';
import ContentCard from '@/src/components/blocks/ContentCard';
import Faq from '@/src/components/blocks/Faq/Faq';
import FaqRow from '@/src/components/blocks/Faq/FaqRow';
import InfoBar from '@/src/components/blocks/Header/InfoBar';
import { HorizontalScrollGridBlok } from '@/src/components/blocks/HorizontalScrollGrid/HorizontalScrollGrid';
import { HorizontalScrollGridCardBlok } from '@/src/components/blocks/HorizontalScrollGrid/HorizontalScrollGridCard';
import ImageCardDisplay from '@/src/components/blocks/ImageCardDisplay';
import ImageCardDisplayItem from '@/src/components/blocks/ImageCardDisplayItem';
import MemberBenefits from '@/src/components/blocks/MemberBenefits/MemberBenefits';
import MemberBenefitsRow from '@/src/components/blocks/MemberBenefits/MemberBenefitsRow';
import { RecommendedProductsBlok } from '@/src/components/blocks/RecommendedProducts';
import Section from '@/src/components/blocks/Section';
import ShoplabCollections from '@/src/components/blocks/ShoplabCollections';
import SplitSectionBlock from '@/src/components/blocks/SplitSectionBlock';
import ButtonBlok from '@/src/components/blocks/UI/ButtonBlok';
import SubTitle from '@/src/components/blocks/UI/SubTitle';
import Text from '@/src/components/blocks/UI/Text';
import Title from '@/src/components/blocks/UI/Title';
import Entries from './Entries';
import CustomBeautyHeader from './gifts/CustomBeautyHeader';
import FlexWithImage from './gifts/FlexWithImage';
import GiftBottomGrid from './gifts/GiftBottomGrid';
import GiftsCardHeader from './gifts/GiftsCardHeader';
import ImageWithText from './gifts/ImageWithText';
import HeroHighlight from './HeroHighlight';
import HeroHighlightWithoutProducts from './HeroHighlightWithoutProducts';
import ItemCardDetails from './ItemCardDetails';
import ItemCardDisplay from './ItemCardDisplay';
import LiveShoppingBanner from './LiveShopping/LiveShoppingBanner';
import LiveShoppingCard from './LiveShopping/LiveShoppingCard';
import ProductCardDisplay from './ProductCardDisplay';
import SeoBlock from './SeoBlock';
import SeoLink from './SeoLink';
import SeoTitle from './SeoTitle';
import ShoplabCollectionItem from './ShoplabCollectionItem';
import SizeGuide from './SizeGuide';
import SizeCharts from './SizeGuide/SizeCharts';
import SizeGuideMeasure from './SizeGuide/SizeGuideMeasure';

export const storyblokComponents: SbReactComponentsMap = {
  infoBar: InfoBar,
  hero: Hero,
  grid: Grid,
  shoplabProducts: ShoplabProducts,
  shoplabCollections: ShoplabCollections,
  collectionItem: ShoplabCollectionItem,
  heroHighlight: HeroHighlight,
  entry: Entry,
  usp: Usp,
  banner: Banner,
  bannerGrid: BannerGrid,
  CmsPageHeader: CmsPageHeader,
  contentCard: ContentCard,
  imageCardDisplay: ImageCardDisplay,
  imageCardDisplayItem: ImageCardDisplayItem,
  button: ButtonBlok,
  subTitle: SubTitle,
  title: Title,
  heroHighlightWithoutProducts: HeroHighlightWithoutProducts,
  itemCardDetails: ItemCardDetails,
  itemCardDisplay: ItemCardDisplay,
  productCardDisplay: ProductCardDisplay,
  text: Text,
  customBeautyHeader: CustomBeautyHeader,
  flexWithImage: FlexWithImage,
  imageWithText: ImageWithText,
  giftsCardHeader: GiftsCardHeader,
  giftBottomGrid: GiftBottomGrid,
  section: Section,
  SplitSectionBlock: SplitSectionBlock,
  entries: Entries,
  faq: Faq,
  faq_row: FaqRow,
  member_benefits: MemberBenefits,
  member_benefits_row: MemberBenefitsRow,
  recommendedProducts: RecommendedProductsBlok,
  liveShoppingCard: LiveShoppingCard,
  liveShoppingBanner: LiveShoppingBanner,
  seoBlock: SeoBlock,
  seoTitle: SeoTitle,
  seoLink: SeoLink,
  sizeGuide: SizeGuide,
  sizeCharts: SizeCharts,
  sizeGuideMeasure: SizeGuideMeasure,
  'horizontal-scroll-grid': HorizontalScrollGridBlok,
  'horizontal-scroll-grid-card': HorizontalScrollGridCardBlok,
};
