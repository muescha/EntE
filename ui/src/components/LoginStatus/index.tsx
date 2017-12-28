import * as React from 'react';

import styles from './styles';
import { WithStyles } from 'material-ui/styles/withStyles';
import { withStyles, IconButton, List } from 'material-ui';
import { connect, Dispatch } from 'react-redux';
import * as select from '../../redux/selectors';
import { AppState } from '../../interfaces/index';
import ListItem from 'material-ui/List/ListItem';
import ListItemText from 'material-ui/List/ListItemText';
import { ExitToApp as ExitToAppIcon } from 'material-ui-icons';
import { Action } from 'redux-actions';
import { logout } from '../../redux/actions';
import ListItemIcon from 'material-ui/List/ListItemIcon';

interface Props {
  username: string;
  logout(): Action<void>;
}

const LoginStatus: React.SFC<Props & WithStyles<string>> = (props) => (
  <div className={props.classes.container}>
    <List>
      <ListItem>
        <ListItemIcon>
          <IconButton aria-label="logout" onClick={() => props.logout()}>
            <ExitToAppIcon />
          </IconButton>
        </ListItemIcon>
        <ListItemText primary={props.username}/>
      </ListItem>
    </List>
  </div>
);

const mapStateToProps = (state: AppState) => ({
  username: select.getUsername(state),
});

const mapDispatchToProps = (dispatch: Dispatch<Action<void>>) => ({
  logout: () => dispatch(logout()),
});

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LoginStatus));