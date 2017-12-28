import { AppState, MongoId, ICredentials, User } from '../interfaces/index';

/**
 * State
 */
export const isLoading = (state: AppState): boolean => state.get('loading') > 0;

/**
 * Auth
 */
export const isAuthValid = (state: AppState): boolean => state.getIn(['auth', 'role']) !== '';
export const wasAuthChecked = (state: AppState): boolean => state.getIn(['auth', 'checked']);

export const getRole = (state: AppState): string => state.getIn(['auth', 'role']);
export const getAuthCredentials = (state: AppState): ICredentials => ({
  username: state.get('auth').get('username'),
  password: state.get('auth').get('password'),
});
export const getChildren = (state: AppState): User[] => state.getIn(['auth', 'children']).toArray();
export const getUsername = (state: AppState): string => state.getIn(['auth', 'username']);

/**
 * Data
 */
export const getEntry = (id: MongoId) => (state: AppState) => state.getIn(['entries', id]);
export const getEntries = (state: AppState) => state.get('entries').toArray();

export const getUser = (id: MongoId) => (state: AppState) => state.getIn(['users', id]);
export const getUsers = (state: AppState) => state.get('users').toArray();

export const getTeachers = (state: AppState) => state
  .get('users')
  .valueSeq()
  .filter((user) => user!.get('role') === 'teacher')
  .toArray();