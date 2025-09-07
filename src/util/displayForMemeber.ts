export const displayForMember = (displayMemberLevel: string | undefined, customerMemberLevel: string) => {
  if (!customerMemberLevel) {
    return !displayMemberLevel || displayMemberLevel === 'all' || displayMemberLevel === 'hideMembers';
  }

  if (displayMemberLevel === 'all') {
    return true;
  }
  if (displayMemberLevel === 'onlyMembers') {
    return !!customerMemberLevel;
  }
  if (displayMemberLevel === 'hideMembers') {
    return false;
  }
  return displayMemberLevel === customerMemberLevel;
};
