function aggregateSelectionState(selectedIds, selectableIds) {
  if (selectableIds.length === 0) {
    return "none";
  }
  if (selectedIds.length === 0) {
    return "none";
  }
  const selectedSet = new Set(selectedIds);
  let matchedCount = 0;
  for (const id of selectableIds) {
    if (selectedSet.has(id)) {
      matchedCount += 1;
    }
  }
  if (matchedCount === 0) {
    return "none";
  }
  if (matchedCount === selectableIds.length) {
    return "all";
  }
  return "some";
}
function nextSelectionForRangeShift(options) {
  const { selectedIds, orderedIds, anchorId, targetId, disabledIds = [] } = options;
  const disabled = new Set(disabledIds);
  const selectedSet = new Set(selectedIds);
  if (anchorId === null || anchorId === targetId) {
    if (disabled.has(targetId)) return [...selectedSet];
    if (selectedSet.has(targetId)) {
      selectedSet.delete(targetId);
    } else {
      selectedSet.add(targetId);
    }
    return [...selectedSet];
  }
  const anchorIndex = orderedIds.indexOf(anchorId);
  const targetIndex = orderedIds.indexOf(targetId);
  if (anchorIndex < 0 || targetIndex < 0) {
    return [...selectedSet];
  }
  const [start, end] = anchorIndex <= targetIndex ? [anchorIndex, targetIndex] : [targetIndex, anchorIndex];
  const anchorSelected = selectedSet.has(anchorId);
  for (let i = start; i <= end; i += 1) {
    const id = orderedIds[i];
    if (disabled.has(id)) continue;
    if (anchorSelected) {
      selectedSet.add(id);
    } else {
      selectedSet.delete(id);
    }
  }
  return [...selectedSet];
}
export {
  aggregateSelectionState,
  nextSelectionForRangeShift
};
//# sourceMappingURL=index25.js.map
