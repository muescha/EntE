/**
 * EntE
 * (c) 2017-present, Simon Knott <info@simonknott.de>
 *
 * This source code is licensed under the GNU Affero General Public License
 * found in the LICENSE file in the root directory of this source tree.
 */

import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import DoneIcon from "@material-ui/icons/Done";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import SignedAvatar from "../../elements/SignedAvatar";
import * as _ from "lodash";
import { Table } from "../../components/Table";
import {
  getSlotsRequest,
  getSlots,
  SlotN,
  getFilterScope,
  getRole,
  addReviewedRecordRequest,
  getUsers,
  getOwnUserId,
  getToken
} from "../../redux";
import withErrorBoundary from "../../hocs/withErrorBoundary";
import { Maybe, None } from "monet";
import { makeTranslationHook } from "../../helpers/makeTranslationHook";
import { format, parseISO } from "date-fns";
import * as enLocale from "date-fns/locale/en-GB";
import * as deLocale from "date-fns/locale/de";
import { getFilterScopeValidator } from "../../filter-scope";
import FilterScopeSelectionView from "../../components/FilterScopeSelectionView";
import { Grid, Theme, IconButton, Fab } from "@material-ui/core";
import { CourseFilterButton } from "../../components/CourseFilterButton";
import { CourseFilter, isSlotDuringCourse } from "../../helpers/course-filter";
import { useTheme, makeStyles } from "@material-ui/styles";
import { unstable_useMediaQuery as useMediaQuery } from "@material-ui/core/useMediaQuery";
import { SlotsTableSmallCard } from "./SlotsTableSmallCard";
import { Roles } from "ente-types";
import { Link } from "react-router-dom";
import { apiBaseUrl } from "../../";
import Axios from "axios";
import { DeleteSlotDialog } from "./DeleteSlotDialog";

function usePrefileDeleter() {
  const token = useSelector(getToken).some();
  const dispatch = useDispatch();
  return React.useCallback(
    async (prefiledSlotId: string) => {
      await Axios.delete(`${apiBaseUrl}/slots/${prefiledSlotId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      dispatch(getSlotsRequest());
    },
    [token, dispatch]
  );
}

const useStyles = makeStyles((theme: Theme) => ({
  fab: {
    margin: 0,
    top: "auto",
    right: theme.spacing.unit * 2,
    bottom: theme.spacing.unit * 2,
    left: "auto",
    position: "fixed"
  },
  deleteContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  deleteIcon: {
    marginLeft: theme.spacing.unit
  }
}));

const useTranslation = makeTranslationHook({
  en: {
    headers: {
      name: "Name",
      date: "Date",
      from: "From",
      to: "To",
      forSchool: "For School",
      status: "Status",
      teacher: "Teacher",
      reviewed: "Review"
    },
    deleted: "Deleted",
    yes: "Yes",
    no: "No",
    locale: enLocale
  },
  de: {
    headers: {
      name: "Name",
      date: "Datum",
      from: "Von",
      to: "Bis",
      forSchool: "Schulisch",
      status: "Status",
      teacher: "Lehrer",
      reviewed: "Abhaken"
    },
    deleted: "Gelöscht",
    yes: "Ja",
    no: "Nein",
    locale: deLocale
  }
});

const Slots = () => {
  const classes = useStyles();

  const lang = useTranslation();
  const slots = useSelector(getSlots);
  const filterScope = useSelector(getFilterScope);
  const role = useSelector(getRole).some();
  const ownUserId = useSelector(getOwnUserId).some();
  const usersArr = useSelector(getUsers);
  const users = _.keyBy(usersArr, u => u.get("id"));

  const dispatch = useDispatch();

  const theme = useTheme<Theme>();
  const isNarrow = useMediaQuery(theme.breakpoints.down("xs"));

  const [courseFilter, setCourseFilter] = React.useState<Maybe<CourseFilter>>(
    None()
  );

  const slotsInScope = React.useMemo(
    () => {
      const validator = getFilterScopeValidator(filterScope);
      return slots.filter(s =>
        validator({
          id: s.get("id"),
          date: parseISO(s.get("date")),
          isInReviewedRecords: s.get("isInReviewedRecords")
        })
      );
    },
    [slots, filterScope]
  );

  const slotsInCourse = React.useMemo(
    () =>
      courseFilter.cata(
        () => slotsInScope,
        course => slotsInScope.filter(isSlotDuringCourse(course))
      ),
    [courseFilter, slotsInScope]
  );

  React.useEffect(
    () => {
      dispatch(getSlotsRequest());
    },
    [dispatch]
  );

  const teacherIds = slots.map(s => s.get("teacherId"));
  const moreThanOneTeacherInSlots = _.uniq(teacherIds).length > 1;

  const addToReviewed = React.useCallback(
    (id: string) => {
      dispatch(addReviewedRecordRequest(id));
    },
    [dispatch]
  );

  const deletePrefiledSlot = usePrefileDeleter();
  const [prefiledSlotToDelete, setPrefiledSlotToDelete] = React.useState<
    string
  >();

  return (
    <>
      <DeleteSlotDialog
        open={!!prefiledSlotToDelete}
        onClose={confirmed => {
          if (confirmed && prefiledSlotToDelete) {
            deletePrefiledSlot(prefiledSlotToDelete);
          }

          setPrefiledSlotToDelete(undefined);
        }}
      />
      <Table<SlotN>
        columns={[
          {
            name: lang.headers.name,
            extract: slot => users[slot.get("studentId")].get("displayname"),
            options: {
              filter: false,
              display: role !== Roles.STUDENT
            }
          },
          {
            name: lang.headers.date,
            extract: slot => slot.get("date"),
            options: {
              filter: false,
              customBodyRender: (isoTime: string) =>
                format(parseISO(isoTime), "PP", { locale: lang.locale })
            }
          },
          {
            name: lang.headers.from,
            extract: slot => slot.get("from"),
            options: {
              filter: false
            }
          },
          {
            name: lang.headers.to,
            extract: slot => slot.get("to"),
            options: {
              filter: false
            }
          },
          {
            name: lang.headers.forSchool,
            extract: slot => (slot.get("forSchool") ? lang.yes : lang.no)
          },
          {
            name: lang.headers.status,
            extract: slot => {
              const id = slot.get("id");
              const isOwn = slot.get("teacherId") === ownUserId;

              let state;
              if (slot.get("isPrefiled")) {
                state = "prefiled";
              } else {
                const isSigned = slot.get("signed");
                state = isSigned ? "signed" : "unsigned";
              }

              return { isOwn, state, id };
            },
            options: {
              customBodyRender: (s: {
                id: string;
                isOwn: boolean;
                state: "prefiled" | "signed" | "unsigned";
              }) => {
                const { isOwn, state, id } = s;
                const avatar = (
                  <SignedAvatar
                    signed={state === "signed"}
                    prefiled={state === "prefiled"}
                  />
                );

                if (state === "prefiled" && isOwn) {
                  return (
                    <span className={classes.deleteContainer}>
                      {avatar}
                      <IconButton
                        onClick={() => setPrefiledSlotToDelete(id)}
                        className={classes.deleteIcon}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </span>
                  );
                }

                return avatar;
              }
            }
          },
          {
            name: lang.headers.teacher,
            extract: slot =>
              Maybe.fromNull(slot.get("teacherId")).cata(
                () => lang.deleted,
                id => users[id].get("displayname")
              ),
            options: {
              filter: moreThanOneTeacherInSlots,
              display: moreThanOneTeacherInSlots
            }
          },
          {
            name: lang.headers.reviewed,
            extract: (slot: SlotN) => slot.get("id"),
            options: {
              filter: false,
              display:
                [Roles.MANAGER, Roles.TEACHER].includes(role) &&
                filterScope === "not_reviewed",
              customBodyRender: (id: string) => {
                return (
                  <IconButton onClick={() => addToReviewed(id)}>
                    <DoneIcon />
                  </IconButton>
                );
              }
            }
          }
        ]}
        title={
          <Grid container direction="row" spacing={16} alignItems="center">
            <Grid item xs={6}>
              <FilterScopeSelectionView />
            </Grid>

            <Grid item xs={6}>
              <CourseFilterButton onChange={setCourseFilter} />
            </Grid>
          </Grid>
        }
        items={slotsInCourse}
        extractId={user => user.get("id")}
        key={`SlotsTable_${filterScope === "not_reviewed"}`}
        customRowRender={
          isNarrow
            ? slot => (
                <SlotsTableSmallCard
                  slot={slot}
                  role={role}
                  studentName={users[slot.get("studentId")].get("displayname")}
                  teacherName={
                    !!slot.get("teacherId")
                      ? users[slot.get("teacherId")!].get("displayname")
                      : lang.deleted
                  }
                  addToReviewed={() => addToReviewed(slot.get("id"))}
                  showAddToReviewed={
                    [Roles.MANAGER, Roles.TEACHER].includes(role) &&
                    filterScope === "not_reviewed"
                  }
                />
              )
            : undefined
        }
        persistenceKey="slots-table"
      />
      <Link to="/slots/prefile">
        <Fab color="primary" className={classes.fab}>
          <AddIcon />
        </Fab>
      </Link>
    </>
  );
};

export default withErrorBoundary()(Slots);
