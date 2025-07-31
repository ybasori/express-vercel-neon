import { useEffect, useState } from "react";
import { ITable } from "./Table.type";

const Table: React.FC<ITable> = ({
  columns,
  data,
  loading,
  totalPage,
  page,
  onPage,
  sort = [],
  onSort,
  filter,
  onFilter,
  check = [],
  onCheckChange,
}) => {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [filterState, setFilterState] = useState<{ [x: string]: any }>({});

  const isAllSelected =
    selectedItems.length > 0 &&
    data.length > 0 &&
    selectedItems.length === data.length;

  const handleCheckboxChange = (id: number, isChecked: boolean) => {
    setSelectedItems((prevSelected) => {
      if (isChecked) {
        onCheckChange?.([...prevSelected, id]);
        return [...prevSelected, id];
      } else {
        onCheckChange?.([...prevSelected.filter((item) => item !== id)]);
        return prevSelected.filter((item) => item !== id);
      }
    });
  };

  const handleHeaderCheckboxChange = (isChecked: boolean) => {
    if (isChecked) {
      const allIds = data.map((_, index) => index); // Get all row IDs dynamically from data
      setSelectedItems(allIds); // Select all items
      onCheckChange?.(allIds);
    } else {
      setSelectedItems([]); // Deselect all items
      onCheckChange?.([]);
    }
  };
  const nestedField = (row: any, field: string) => {
    const splited = field.split(".");
    if (splited.length > 1) {
      let dt = row[splited[0]];

      for (let i = 1; i < splited.length; i++) {
        if (!!dt && dt[splited[i]]) {
          dt = dt[splited[i]];
        } else {
          dt = null;
          i += splited.length;
        }
      }

      return dt;
    } else {
      return row[field];
    }
  };

  const listPage = (total: number) => {
    let list: number[] = [];
    for (let i = 1; i <= total; i++) {
      list = [...list, i];
    }
    return list;
  };

  const handleSort = (
    item: { field: string },
    sortItem?: { order: string }
  ) => {
    if (!!item.field) {
      let newData: {
        by: string;
        order: "asc" | "desc";
      } | null = null;
      if (!!!sortItem) {
        newData = {
          by: item.field,
          order: "asc",
        };
      }
      if (!!sortItem && sortItem.order === "asc") {
        newData = {
          by: item.field,
          order: "desc",
        };
      }
      if (!!newData) {
        onSort?.([...sort.filter((sitem) => sitem.by !== item.field), newData]);
      } else {
        onSort?.([...sort.filter((sitem) => sitem.by !== item.field)]);
      }
    }
  };

  useEffect(() => {
    setFilterState({ ...filter });
  }, [filter]);

  useEffect(() => {
    setSelectedItems(check);
  }, [check]);

  return (
    <>
      <div className="table-container">
        <table className="table is-hoverable is-fullwidth">
          <thead>
            <tr>
              <th>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      handleHeaderCheckboxChange(e.currentTarget.checked)
                    }
                    checked={isAllSelected}
                  />
                </label>
              </th>
              {columns.map((item, key) => {
                const sortItem = sort.find((s) => s.by === item.field);
                return (
                  <th key={key}>
                    {item.name}{" "}
                    {item.sortable ? (
                      <a
                        onClick={(e) => {
                          e.preventDefault();
                          handleSort(item as { field: string }, sortItem);
                        }}
                      >
                        {!!sortItem ? (
                          sortItem.order === "desc" ? (
                            <i className="fa-solid fa-sort-up"></i>
                          ) : (
                            <i className="fa-solid fa-sort-down"></i>
                          )
                        ) : (
                          <i className="fa-solid fa-sort"></i>
                        )}
                      </a>
                    ) : null}
                    {item.searchable ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();

                          onFilter?.({ ...filterState });
                        }}
                      >
                        <input
                          className="input is-small"
                          type="text"
                          placeholder={item.name}
                          name={item.field}
                          value={
                            !!item.field ? filterState[item.field] ?? "" : ""
                          }
                          onChange={(e) => {
                            const newData = {
                              ...filterState,
                              [e.currentTarget.name]: e.currentTarget.value,
                            };
                            if (newData[e.currentTarget.name] === "") {
                              delete newData[e.currentTarget.name];
                            }
                            setFilterState({
                              ...newData,
                            });
                          }}
                        />
                      </form>
                    ) : null}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1}>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                </td>
              </tr>
            ) : (
              <>
                {data.length > 0 ? (
                  <>
                    {data.map((item, key) => (
                      <tr key={key}>
                        <td>
                          <label className="checkbox">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(key)}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  key,
                                  e.currentTarget.checked
                                )
                              }
                            />
                          </label>
                        </td>
                        {columns.map((column, key) => (
                          <td key={key}>
                            {!!column.render
                              ? column.render(
                                  !!column.field
                                    ? nestedField(item, column.field)
                                    : null,
                                  item
                                )
                              : !!column.field
                              ? nestedField(item, column.field)
                              : null}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ) : (
                  <tr>
                    <td colSpan={columns.length + 1}>No data</td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="columns">
        <div className="column">
          <div className="select is-small">
            <select
              value={page.size}
              onChange={(e) =>
                onPage({ ...page, of: 1, size: Number(e.currentTarget.value) })
              }
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="30">30</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
        <div className="column is-three-fifths">
          <nav
            className="pagination is-small"
            role="navigation"
            aria-label="pagination"
          >
            <a
              className={`pagination-previous ${
                page.of === 1 ? `is-disabled` : ``
              }`}
              onClick={(e) => {
                e.preventDefault();

                if (page.of > 1) {
                  onPage({ ...page, of: page.of - 1 });
                  handleHeaderCheckboxChange(false);
                }
              }}
            >
              Previous
            </a>
            <a
              className={`pagination-next ${
                page.of === totalPage ? `is-disabled` : ``
              }`}
              onClick={(e) => {
                e.preventDefault();

                if (page.of < totalPage) {
                  onPage({ ...page, of: page.of + 1 });
                  handleHeaderCheckboxChange(false);
                }
              }}
            >
              Next page
            </a>
            <ul className="pagination-list m-0">
              {/* <li>
            <a href="#" className="pagination-link" aria-label="Goto page 1">
              1
            </a>
          </li>
          <li>
            <span className="pagination-ellipsis">&hellip;</span>
          </li> */}

              {listPage(totalPage)
                .filter(
                  (item) =>
                    page.of -
                      (totalPage - page.of <= 2
                        ? 5 - (totalPage - page.of)
                        : 3) <
                      item && item <= page.of + (page.of <= 2 ? 5 - page.of : 2)
                )
                .map((item, key) => (
                  <li key={key}>
                    <a
                      className={`pagination-link  ${
                        item === page.of ? `is-current` : ``
                      }`}
                      aria-label={`Goto page ${item}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleHeaderCheckboxChange(false);
                        return onPage({ ...page, of: item });
                      }}
                    >
                      {item}
                    </a>
                  </li>
                ))}

              {/* <li>
            <span className="pagination-ellipsis">&hellip;</span>
          </li>
          <li>
            <a href="#" className="pagination-link" aria-label="Goto page 86">
              86
            </a>
          </li> */}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Table;
