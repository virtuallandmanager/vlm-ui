function checkIfAdjacent(reference, check) {
  const hasMatchingX = reference.x == check.x;
  const hasMatchingY = reference.y == check.y;

  const northOfGroupedParcel = hasMatchingX && reference.y - check.y == 1;
  const southOfGroupedParcel = hasMatchingX && reference.y - check.y == -1;
  const eastOfGroupedParcel = hasMatchingY && reference.x - check.x == 1;
  const westOfGroupedParcel = hasMatchingY && reference.x - check.x == -1;

  return northOfGroupedParcel || southOfGroupedParcel || eastOfGroupedParcel || westOfGroupedParcel;
}

function checkIfGrouped(parcel, groupedParcels) {
  return groupedParcels.some((group) => {
    return group.parcels.find((parcelInGroup) => parcel.tokenId == parcelInGroup.tokenId);
  });
}

function findAllNeighboring(selected) {
  const neighboring = [];
  selected.forEach((a) => {
    const neighbors = selected.filter((b) => {
      checkIfAdjacent(a, b);
    });
    neighboring.push(...neighbors);
  });
}

function findGroup(parcel, groupedParcels) {
  const parcelGroup = groupedParcels.find((group) => {
    return group.parcels.find((parcelInGroup) => parcel.tokenId == parcelInGroup.tokenId);
  });

  return parcelGroup.group;
}

function findAdjacentParcels(parcels, selected) {
  console.log("~~~~~~~~~~~~~~~~~SELECTION MADE~~~~~~~~~~~~~~~");

  const selectedParcels = parcels.filter((parcel, i) => selected[i]);

  const sortedSelections = selectedParcels.sort((a, b) => {
    return a.x - b.x || a.y - b.y;
  });

  const groupedParcels = [];
  let groupCount = 1;

  const neighboringParcels = findAllNeighboring(sortedSelections);

  const groupedNeighboringParcels = neighboringParcels.filter((adjacentParcel) => checkIfGrouped(adjacentParcel, groupedParcels));
  const ungroupedNeighboringParcels = neighboringParcels.filter((adjacentParcel) => !checkIfGrouped(adjacentParcel, groupedParcels));

  if (groupedNeighboringParcels.length) {
    const groupId = findGroup(groupedNeighboringParcels[0], groupedParcels);
    const groupIndex = groupedParcels.findIndex((group) => group.group == groupId);
    const parcelsToGroup = [...ungroupedNeighboringParcels];

    parcelsToGroup.forEach((parcel) => {
      groupedParcels[groupIndex].parcels.push(parcel);
      console.log(`added ${parcel.x}, ${parcel.y}`);
    });
  } else if (ungroupedNeighboringParcels.length) {
    const parcelsToGroup = [currentParcel, ...ungroupedNeighboringParcels];
    groupedParcels.push({ group: groupCount, parcels: parcelsToGroup });
  }

  const groupedParcelCoords = groupedParcels.map((group) => {
    const groupId = group.group;
    const coords = group.parcels.map((parcel) => `${parcel.x}, ${parcel.y}`);

    return { group: groupId, coords };
  });

  console.log("groups: ", groupedParcels);
  const groupsWithCoords = groupedParcels.map((group) => {
    const parcelsInGroup = groupedParcelCoords.find((groupedCoord) => group.group == groupedCoord.group);
    const coords = parcelsInGroup.coords;
    return { ...group, coords };
  });

  return groupsWithCoords;
}

export default {
  findAdjacentParcels
};
