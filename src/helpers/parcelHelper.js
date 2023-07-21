export function xCoords(parcels) {
  return parcels.map((coord) => coord.x);
}
export function yCoords(parcels) {
  return parcels.map((coord) => coord.y);
}
export function lowestX(xCoords) {
  return xCoords.sort((a, b) => a - b)[0];
}
export function lowestY(yCoords) {
  return yCoords.sort((a, b) => a - b)[0];
}
export function highestX(xCoords) {
  return xCoords.sort((a, b) => b - a)[0] - 0;
}
export function highestY(yCoords) {
  return yCoords.sort((a, b) => b - a)[0] - 0;
}
export function parcelRows(yArray) {
  return 1 + highestY(yArray) - lowestY(yArray);
}
export function parcelCols(xArray) {
  return 1 + highestX(xArray) - lowestX(xArray);
}
export function createRows(parcels) {
  const yArray = yCoords(parcels);
  const highestYCoord = highestY(yArray);
  const numberOfRows = parcelRows(yArray);
  const rows = new Array(numberOfRows);

  for (let i = 0; i < numberOfRows; i++) {
    const rowNumber = highestYCoord - i;
    const filteredRows = parcels.filter((parcel) => parcel.y == rowNumber);
    rows[i] = filteredRows.map((row) => ({ rowNumber, row }));
  }
  console.log("rows: ", rows);
  return rows;
}
export function createCols(parcels) {
  const xArray = xCoords(parcels);
  const highestXCoord = highestX(xArray);
  const numberOfCols = parcelCols(xArray);
  const cols = new Array(numberOfCols);

  for (let i = 0; i < numberOfCols; i++) {
    const colNumber = highestXCoord - i;
    const filteredCols = parcels.filter((parcel) => parcel.x == colNumber);
    cols[i] = filteredCols.map((column) => ({ colNumber, column }));
  }
  console.log("cols: ", cols);
  return cols;
}

export function getRowsAndCols(parcels) {
  return { rows: createRows(parcels), cols: createCols(parcels) };
}

export function groupAdjacentParcels(parcels) {
  const ungroupedParcels = [...parcels],
    groupedParcels = [];
  let groupId = 0,
    parcelsAdded = 0; //tracks the number of parcels added to a group after one full iteration

  for (let i = 0; ungroupedParcels.length > 0; i++) {
    console.log(`${ungroupedParcels.length} ungrouped parcels left`);
    const parcel = ungroupedParcels[i],
      parcelString = `${parcel.x},${parcel.y}`;

    if (!groupedParcels[groupId]) {
      /* there isn't an array in place for this groupId,
      insert an empty array to start the new group */
      groupedParcels[groupId] = [];
    }

    if (groupedParcels[groupId].length < 1 && i == 0) {
      /*
      this is the first parcel or we're starting a new group
      create a new group, then we'll compare the other parcels in the array against this parcel
      */
      console.log(`adding ${parcelString} to group ${groupId}`);
      groupedParcels[groupId] = [parcelString];
      ungroupedParcels.splice(i, 1);
      parcelsAdded++;
      i = -1;
      continue;
    }

    if (groupedParcels[groupId].includes(parcelString)) {
      continue;
    }

    const adjacentParcel = findGroupForParcel(groupedParcels[groupId], parcel);

    if (adjacentParcel) {
      /*
      this parcel is adjacent to another parcel in the current group
      add it to that group and remove it from the ungrouped array
      */
      console.log(`adding ${parcelString} to group ${groupId}`);
      groupedParcels[groupId].push(parcelString);
      ungroupedParcels.splice(i, 1);
      parcelsAdded++;
    }

    /*
      NOTE: sometimes 'i' can be greater than the array length here
      if we've just removed an item!
    */

    if (i >= ungroupedParcels.length - 1 && parcelsAdded < 1) {
      /*
      no adjacent parcels are left in the ungrouped parcel array
      create a new group and start iterating again
      */
      i = -1;
      groupId++;
      parcelsAdded = 0;
      continue;
    } else if (i >= ungroupedParcels.length - 1 && parcelsAdded > 0) {
      /*
      go back to the start and check if any parcels we already checked 
      are now adjacent to a grouped parcel
      */
      i = -1;
      parcelsAdded = 0;
    }
  }
  const sortedParcels = groupedParcels.map((group) =>
    group.sort((a, b) => {
      a = a.split(",");
      b = b.split(",");

      if (a[0] == b[0]) {
        return a[1] - b[1];
      }
      return a[0] - b[0];
    })
  );
  return sortedParcels;
}

export function findGroupForParcel(groupedParcels, ungroupedParcel) {
  return groupedParcels.find((g) => {
    const groupedParcel = {
        x: parseInt(g.split(",")[0]),
        y: parseInt(g.split(",")[1]),
      },
      ungrouped = {
        x: parseInt(ungroupedParcel.x),
        y: parseInt(ungroupedParcel.y),
      };

    const isNorth =
        groupedParcel.x == ungrouped.x && groupedParcel.y == ungrouped.y - 1,
      isSouth =
        groupedParcel.x == ungrouped.x && groupedParcel.y == ungrouped.y + 1,
      isEast =
        groupedParcel.y == ungrouped.y && groupedParcel.x == ungrouped.x - 1,
      isWest =
        groupedParcel.y == ungrouped.y && groupedParcel.x == ungrouped.x + 1;

    return isNorth || isSouth || isEast || isWest;
  });
}
