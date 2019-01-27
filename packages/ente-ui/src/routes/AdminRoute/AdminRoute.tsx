import * as React from "react";
import { connect, MapDispatchToPropsParam } from "react-redux";
import {
  Button,
  WithStyles,
  withStyles,
  Theme,
  Grid,
  Divider
} from "@material-ui/core";
import AttachmentIcon from "@material-ui/icons/Attachment";
import ImportExportIcon from "@material-ui/icons/ImportExport";
import { downloadExcelExportRequest } from "../../redux";
import withErrorBoundary from "../../hocs/withErrorBoundary";
import { makeTranslationHook } from "../../helpers/makeTranslationHook";
import ImportUsers from "../ImportUsers";
import LoginBannerEditor from "./LoginBannerEditor";
import { Languages } from "ente-types";
import DefaultLanguageUpdater from "./DefaultLanguageUpdater";
import { Description } from "../../components/Description";

const useTranslation = makeTranslationHook({
  en: {
    downloadExcel: "Download Excel Export",
    importUsers: "Import Users",
    defaultLanguage: "Default Language",
    defaultLanguageDescription: "New users have this language set",
    loginBanner: "Login-Banner",
    loginBannerDescription: "This text is shown on the login page."
  },
  de: {
    downloadExcel: "Excel Export downloaden",
    importUsers: "Nutzer importieren",
    defaultLanguage: "Standard-Sprache",
    defaultLanguageDescription:
      "Neue Nutzer haben diese Sprache voreingestellt",
    loginBanner: "Login-Banner",
    loginBannerDescription: "Dieser Text wird auf der Login-Seite angezeigt."
  }
});

const styles = (theme: Theme) => ({
  iconLeft: {
    marginRight: theme.spacing.unit
  },
  container: {
    margin: theme.spacing.unit
  }
});

interface AdminRouteOwnProps {}

interface AdminRouteStateProps {}

interface AdminRouteDispatchProps {
  downloadExcelExport: () => void;
}

const mapDispatchToProps: MapDispatchToPropsParam<
  AdminRouteDispatchProps,
  AdminRouteOwnProps
> = dispatch => ({
  downloadExcelExport: () => dispatch(downloadExcelExportRequest())
});

type AdminRouteProps = AdminRouteOwnProps &
  AdminRouteStateProps &
  AdminRouteDispatchProps &
  WithStyles;

const AdminRoute: React.SFC<AdminRouteProps> = React.memo(props => {
  const { downloadExcelExport, classes } = props;
  const lang = useTranslation();
  const [showImportUsers, setShowImportUsers] = React.useState(false);

  const handleOnShowImportUsers = React.useCallback(
    () => setShowImportUsers(true),
    [setShowImportUsers]
  );

  const handleOnCloseImportUsers = React.useCallback(
    () => setShowImportUsers(false),
    [setShowImportUsers]
  );

  return (
    <>
      <ImportUsers show={showImportUsers} onClose={handleOnCloseImportUsers} />
      <Grid
        container
        direction="column"
        spacing={24}
        className={classes.container}
      >
        <Grid item>
          <Grid container direction="row" spacing={24}>
            <Grid item>
              <Button variant="outlined" onClick={downloadExcelExport}>
                <AttachmentIcon className={classes.iconLeft} />
                {lang.downloadExcel}
              </Button>
            </Grid>

            <Grid item>
              <Button variant="outlined" onClick={handleOnShowImportUsers}>
                <ImportExportIcon className={classes.iconLeft} />
                {lang.importUsers}
              </Button>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={10}>
          <Divider variant="fullWidth" />
        </Grid>

        <Grid item>
          <Grid container direction="row" justify="flex-start" spacing={16}>
            <Grid item xs={12} md={5}>
              <Description title={lang.defaultLanguage}>
                {lang.loginBannerDescription}
              </Description>
            </Grid>
            <Grid item xs={11} md={5}>
              <DefaultLanguageUpdater />
            </Grid>
          </Grid>
        </Grid>

        <Grid item>
          <Grid container direction="column" spacing={16}>
            <Grid item>
              <Description title={lang.loginBanner}>
                {lang.loginBannerDescription}
              </Description>
            </Grid>
            <Grid item>
              <Grid container spacing={16}>
                <Grid item xs={11} md={5}>
                  <LoginBannerEditor language={Languages.ENGLISH} />
                </Grid>
                <Grid item xs={11} md={5}>
                  <LoginBannerEditor language={Languages.GERMAN} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
});

export default connect(
  undefined,
  mapDispatchToProps
)(withStyles(styles)(withErrorBoundary()(AdminRoute)));