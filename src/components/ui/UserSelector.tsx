import UserIcon from '@images/icons/user.svg';
import UserActiveIcon from '@images/icons/user-active.svg';
import React, { useMemo } from 'react';
import { useUser } from '@/src/context/authContext';
import { useCart } from '@/src/context/cartContext';
import { useUserDrawer } from '@/src/context/userDrawerContext';
import { useVoyado } from '@/src/context/voyadoContext';
import { Link } from '@/src/i18n/navigation';
import { UserModalViewEnum } from '@/src/lib/types/common';

const UserSelector = () => {
  const { cart } = useCart();
  const { user, isSignedIn } = useUser();
  const { customer } = useVoyado();
  const displayName = useMemo(() => customer?.displayName || user?.email, [customer, user]);

  const { setShowView } = useUserDrawer();

  return (
    <>
      {isSignedIn ? (
        <Link href={'/profile'} rel={'noopener noreferrer'} target={'_self'} className={'relative inline-flex'}>
          <UserActiveIcon className={'h-5'} />
          {/*{cart?.discountExternals && cart?.discountExternals.length > 0 && (
            <span>{cart?.discountExternals.length} </span>
          )}*/}
          {!!displayName && (
            <></>
            // <div
            //   className={
            //     'flex absolute -top-1 -right-3 justify-center items-center w-5 h-5 text-xs text-white rounded-full bg-green'
            //   }
            // >
            //   <span>{displayName.slice(0, 1).toUpperCase()}</span>
            // </div>
          )}
        </Link>
      ) : (
        <div
          className={'realative cursor-pointer'}
          onClick={() => {
            setShowView(UserModalViewEnum.LOGIN);
          }}
        >
          <UserIcon className={'mr-1 h-5'} />
          {cart?.discountExternals && cart?.discountExternals.length > 0 && (
            <span>{cart?.discountExternals.length} </span>
          )}
        </div>
      )}
    </>
  );
};

export default UserSelector;
