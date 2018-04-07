import * as React from "react";
import styles from "./styles";
import withStyles, { WithStyles } from "material-ui/styles/withStyles";
import { Dialog, Grid, Button } from "material-ui";
import { withMobileDialog } from "material-ui/Dialog";
import { connect } from "react-redux";
import { Dispatch, Action } from "redux";
import Dropzone from "react-dropzone";
import DialogActions from "material-ui/Dialog/DialogActions";
import UnsignedAvatar from "../../../SpecificEntry/elements/UnsignedAvatar";
import SignedAvatar from "../../../SpecificEntry/elements/SignedAvatar";
import { IUserCreate } from "ente-types";
import { AppState, createUsersRequest, addMessage } from "ente-redux";
import { parseCSVFromFile } from "ente-parser";

interface OwnProps {
  onClose(): void;
  show: boolean;
}

interface StateProps {}
const mapStateToProps = (state: AppState) => ({});

interface DispatchProps {
  createUsers(users: IUserCreate[]): void;
  addMessage(msg: string): void;
}
const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  createUsers: (users: IUserCreate[]) => dispatch(createUsersRequest(users)),
  addMessage: (msg: string) => dispatch(addMessage(msg))
});

interface InjectedProps {
  fullScreen: boolean;
}

interface State {
  users: IUserCreate[];
  error: boolean;
}

type Props = OwnProps & DispatchProps & StateProps & WithStyles & InjectedProps;

export class ImportUsers extends React.Component<Props, State> {
  state: State = {
    users: [],
    error: true
  };

  onDrop = async (accepted: File[], rejected: File[]) => {
    try {
      const users = await parseCSVFromFile(accepted[0]);
      this.setState({ users, error: false });
    } catch (error) {
      this.setState({ error: true });
      this.props.addMessage(error.message);
    }
  };

  handleClose = () => this.props.onClose();
  handleSubmit = () => this.state.users.length !== 0 && this.props.createUsers(this.state.users);

  /**
   * # Validation
   */
  inputValid = (): boolean => !this.state.error && this.state.users.length !== 0;

  render() {
    const { show, fullScreen } = this.props;
    const { error } = this.state;
    return (
      <Dialog
        fullScreen={fullScreen}
        onClose={this.handleClose}
        open={show}
      >
        <Grid container direction="column">
          <Grid item xs={12}>
            <Dropzone
              accept="text/csv"
              onDrop={this.onDrop}
              className="dropzone"
            >
              Drop items here!
            </Dropzone>
          </Grid>
          <Grid item xs={12}>
            {error ? <UnsignedAvatar /> : <SignedAvatar />}
          </Grid>
        </Grid>
        <DialogActions>
          <Button onClick={this.handleClose} color="secondary" className="close">
            Cancel
          </Button>
          <Button
            onClick={() => {
              this.handleSubmit();
              this.handleClose();
            }}
            disabled={!this.inputValid()}
            color="primary"
            className="submit"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(withMobileDialog<OwnProps & DispatchProps & StateProps>()(withStyles(styles)(ImportUsers)));
