export type ProfileSelectionBlock
  = | {
    type: "profile";
    profileId: string;
  }
  | {
    type: "group";
    groupId: string;
    profileIds: readonly string[];
  };

function getFirstVisibleProfileId(
  block: ProfileSelectionBlock,
  openGroupIds: ReadonlySet<string>,
) {
  if (block.type === "profile") {
    return block.profileId;
  }

  if (openGroupIds.has(block.groupId)) {
    return block.profileIds[0];
  }

  return undefined;
}

export function findProfileIdAfterGroupCollapse(
  blocks: readonly ProfileSelectionBlock[],
  collapsedGroupId: string,
  openGroupIds: ReadonlySet<string>,
) {
  const collapsedGroupIndex = blocks.findIndex(
    block => block.type === "group" && block.groupId === collapsedGroupId,
  );
  if (collapsedGroupIndex === -1) {
    return undefined;
  }

  for (let index = collapsedGroupIndex + 1; index < blocks.length; index++) {
    const profileId = getFirstVisibleProfileId(blocks[index]!, openGroupIds);
    if (profileId) {
      return profileId;
    }
  }

  for (let index = collapsedGroupIndex - 1; index >= 0; index--) {
    const profileId = getFirstVisibleProfileId(blocks[index]!, openGroupIds);
    if (profileId) {
      return profileId;
    }
  }

  return undefined;
}
