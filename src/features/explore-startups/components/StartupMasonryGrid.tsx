import { useSyncExternalStore, type ReactNode } from 'react';
import { Grid } from '../Explore.styles';

function subscribe(onChange: () => void) {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
}
function columns() {
  return window.innerWidth <= 700
    ? 1
    : window.innerWidth >= 1800
      ? 4
      : window.innerWidth >= 1450
        ? 3
        : 2;
}
// Independent vertical stacks keep variable-height cards compact without experimental CSS masonry.
export function StartupMasonryGrid({
  items,
  list,
  render,
}: {
  items: { id: string }[];
  list: boolean;
  render: (index: number) => ReactNode;
}) {
  const count = useSyncExternalStore(subscribe, columns, () => 2);
  const columnCount = list ? 1 : Math.min(count, items.length);
  return (
    <Grid
      $list={list}
      style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: columnCount }, (_, column) => (
        <div key={column}>
          {items.map((item, index) =>
            index % columnCount === column ? (
              <div key={item.id}>{render(index)}</div>
            ) : null,
          )}
        </div>
      ))}
    </Grid>
  );
}
