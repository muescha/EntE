/**
 * EntE
 * (c) 2017-present, Simon Knott <info@simonknott.de>
 *
 * This source code is licensed under the GNU Affero General Public License
 * found in the LICENSE file in the root directory of this source tree.
 */

import * as React from "react";
import {
  connect,
  MapDispatchToPropsParam,
  MapStateToPropsParam
} from "react-redux";
import ChildrenInput from "../elements/ChildrenInput";
import SwitchInput from "../elements/SwitchInput";
import TextInput from "../elements/TextInput";
import { withRouter, RouteComponentProps } from "react-router";
import {
  Button,
  Dialog,
  Grid,
  IconButton,
  withStyles,
  StyleRulesCallback,
  WithStyles
} from "@material-ui/core";
import withMobileDialog, {
  InjectedProps
} from "@material-ui/core/withMobileDialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContentText from "@material-ui/core/DialogContentText";
import { Delete as DeleteIcon } from "@material-ui/icons";
import LoadingIndicator from "../elements/LoadingIndicator";
import * as _ from "lodash";
import {
  AppState,
  getUser,
  isLoading,
  getUserRequest,
  getStudents,
  userHasChildren,
  updateUserRequest,
  userIsStudent,
  UserN,
  deleteUserRequest,
  roleHasGradYear
} from "../redux";
import withErrorBoundary from "../hocs/withErrorBoundary";
import {
  PatchUserDto,
  isValidDisplayname,
  isValidEmail,
  isValidPatchUserDto
} from "ente-types";
import { DeleteModal } from "../components/DeleteModal";
import { YearPicker } from "../elements/YearPicker";
import { createTranslation } from "../helpers/createTranslation";

const lang = createTranslation({
  en: {
    submit: "OK",
    close: "Close",
    titles: {
      email: "Email",
      displayname: "Displayname",
      isAdult: "Adult",
      id: "ID",
      role: "Role",
      gradYear: "Graduation Year"
    }
  },
  de: {
    submit: "OK",
    close: "Schließen",
    titles: {
      email: "Email",
      displayname: "Displayname",
      isAdult: "Erwachsen",
      id: "ID",
      role: "Rolle",
      gradYear: "Abschluss-Jahrgang"
    }
  }
});

const styles: StyleRulesCallback<"deleteButton"> = theme => ({
  deleteButton: {
    position: "absolute",
    top: 0,
    right: 0
  }
});

/**
 * # Component Types
 */
interface RouteMatch {
  userId: string;
}
interface SpecificUserStateProps {
  getUser(id: string): UserN;
  loading: boolean;
  students: UserN[];
}
const mapStateToProps: MapStateToPropsParam<
  SpecificUserStateProps,
  SpecificUserOwnProps,
  AppState
> = state => ({
  getUser: id => getUser(id)(state),
  loading: isLoading(state),
  students: getStudents(state)
});

interface SpecificUserDispatchProps {
  requestUser(id: string): void;
  updateUser(id: string, u: PatchUserDto): void;
  deleteUser(id: string): void;
}
const mapDispatchToProps: MapDispatchToPropsParam<
  SpecificUserDispatchProps,
  SpecificUserOwnProps
> = dispatch => ({
  requestUser: id => dispatch(getUserRequest(id)),
  updateUser: (id, user) => dispatch(updateUserRequest([id, user])),
  deleteUser: id => dispatch(deleteUserRequest(id))
});

interface SpecificUserOwnProps {}

type SpecificUserProps = SpecificUserStateProps &
  SpecificUserOwnProps &
  RouteComponentProps<RouteMatch> &
  SpecificUserDispatchProps &
  InjectedProps;

interface State {
  patch: PatchUserDto;
  showDelete: boolean;
}

/**
 * # Component
 */
export class SpecificUser extends React.PureComponent<
  SpecificUserProps & WithStyles<"deleteButton">,
  State
> {
  /**
   * ## Intialization
   */
  state: State = {
    patch: new PatchUserDto(),
    showDelete: false
  };

  /**
   * ## Lifecycle Hooks
   */
  componentDidMount() {
    const { userId } = this.props.match.params;
    const user = this.props.getUser(userId);

    if (!user) {
      this.props.requestUser(userId);
    }
  }

  update = (key: keyof PatchUserDto) => (value: any) => {
    const clone = Object.assign({}, this.state.patch);
    clone[key] = value;
    this.setState({ patch: clone });
  };

  /**
   * ## Handlers
   */
  onClose = () => this.props.history.goBack();
  onGoBack = () => this.onClose();
  onSubmit = () => {
    const { updateUser } = this.props;
    const { patch } = this.state;

    updateUser(this.userId, patch);

    this.onClose();
  };

  get userId() {
    return this.props.match.params.userId;
  }

  /**
   * ## Render
   */
  render() {
    const {
      fullScreen,
      loading,
      getUser,
      students,
      deleteUser,
      classes
    } = this.props;
    const { patch, showDelete } = this.state;

    const user = getUser(this.userId);

    return (
      <>
        <DeleteModal
          show={showDelete}
          onClose={() => this.setState({ showDelete: false })}
          onDelete={() => {
            this.setState({ showDelete: false });
            deleteUser(this.userId);
            this.onClose();
          }}
          text={`Sind sie sicher, dass sie den Nutzer "${user &&
            user.get("username")}" löschen möchten?`}
        />
        <Dialog open onClose={this.onGoBack} fullScreen={fullScreen}>
          {!!user ? (
            <>
              <DialogTitle>
                {user.get("displayname")}
                <IconButton
                  aria-label="Löschen"
                  onClick={() => this.setState({ showDelete: true })}
                  className={classes.deleteButton}
                >
                  <DeleteIcon fontSize="large" />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={24} alignItems="stretch">
                  <Grid item xs={12}>
                    <DialogContentText>
                      {lang.titles.id}: {user.get("id")} <br />
                      {lang.titles.role}: {user.get("role")} <br />
                    </DialogContentText>
                  </Grid>

                  {/* Displayname */}
                  <Grid item xs={12}>
                    <TextInput
                      title={lang.titles.displayname}
                      value={patch.displayname || user.get("displayname")}
                      onChange={this.update("displayname")}
                      validator={isValidDisplayname}
                    />
                  </Grid>

                  {/* Email */}
                  <Grid item xs={12}>
                    <TextInput
                      title={lang.titles.email}
                      value={patch.email || user.get("email")}
                      onChange={this.update("email")}
                      validator={isValidEmail}
                    />
                  </Grid>

                  {/* IsAdult */}
                  {userIsStudent(user) && (
                    <Grid item xs={6}>
                      <SwitchInput
                        value={user.get("isAdult")}
                        title={lang.titles.isAdult}
                        onChange={this.update("isAdult")}
                      />
                    </Grid>
                  )}

                  {/* Graduation Year */}
                  {roleHasGradYear(user.get("role")) && (
                    <Grid item xs={6}>
                      <YearPicker
                        label={lang.titles.gradYear}
                        onChange={this.update("graduationYear")}
                        amount={5}
                        value={
                          patch.graduationYear || user.get("graduationYear")
                        }
                      />
                    </Grid>
                  )}

                  {/* Children */}
                  {userHasChildren(user) && (
                    <Grid item xs={12}>
                      <ChildrenInput
                        children={
                          !!patch.children
                            ? patch.children.map(getUser)
                            : user.get("childrenIds").map(getUser)
                        }
                        students={students}
                        onChange={c =>
                          this.update("children")(c.map(v => v.get("id")))
                        }
                      />
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
            </>
          ) : (
            loading && <LoadingIndicator />
          )}
          <DialogActions>
            <Button size="small" color="secondary" onClick={this.onClose}>
              {lang.close}
            </Button>
            <Button
              size="small"
              color="primary"
              onClick={this.onSubmit}
              disabled={!isValidPatchUserDto(this.state.patch)}
            >
              {lang.submit}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(
  withRouter(
    withMobileDialog()(withErrorBoundary()(withStyles(styles)(SpecificUser)))
  )
);
