import * as React from 'react';
import { WithStyles } from 'material-ui/styles/withStyles';
import { Grid, withStyles, Button, TextField } from 'material-ui';
import { AppState, IUser, MongoId, User } from '../../../../interfaces/index';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import { Update as UpdateIcon } from 'material-ui-icons';

import * as select from '../../../../redux/selectors';
import styles from './styles';
import { updateUserRequest } from '../../../../redux/actions';
import Typography from 'material-ui/Typography/Typography';

interface IProps {
  userId: MongoId;
  updateUser(user: Partial<IUser>): Action;
  getUser(id: MongoId): User;
}
interface State {
  displayname: string;
}

type Props = IProps & WithStyles;

const mapStateToProps = (state: AppState) => ({
  getUser: (id: MongoId) => select.getUser(id)(state),
});
const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  updateUser: (user: Partial<IUser>) => dispatch(updateUserRequest(user)),
});

const DisplayNameUpdate = connect(mapStateToProps, mapDispatchToProps)(
  withStyles(styles)(
    class extends React.Component<Props, State> {
      user = (): User => this.props.getUser(this.props.userId);

      state: State = {
        displayname: this.user().get('displayname'),
      };

      handleSubmit = () =>
        this.props.updateUser({
          _id: this.props.userId,
          displayname: this.state.displayname,
        });

      handleChange: React.ChangeEventHandler<HTMLInputElement> = event =>
        this.setState({
          displayname: event.target.value,
        });

      render() {
        return (
          <Grid container direction="column">
            <Grid item>
              <Typography variant="title">Anzeigename</Typography>
            </Grid>
            <Grid item>
              <TextField fullWidth value={this.state.displayname} onChange={this.handleChange} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="raised" color="primary" onClick={() => this.handleSubmit()}>
                Anzeigenamen aktualisieren
                <UpdateIcon />
              </Button>
            </Grid>
          </Grid>
        );
      }
    },
  ),
);

export default DisplayNameUpdate;
