import { useIdentification } from '@/src/context/identificationContext';
import { displayForMember } from '@/src/util/displayForMemeber';

export const withMemberLevelCheck = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  return function WithMemberLevelCheckComponent(props: P & { memberLevel?: string }) {
    const { getTokenPayload } = useIdentification();
    const customerMemberLevel = getTokenPayload()?.memberLevel;
    const shouldDisplayBlock = displayForMember(props.memberLevel, customerMemberLevel ?? '');

    if (!shouldDisplayBlock) return null;

    return <WrappedComponent {...props} />;
  };
};
