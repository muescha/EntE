/**
 * EntE
 * (c) 2017-present, Simon Knott <info@simonknott.de>
 *
 * This source code is licensed under the GNU Affero General Public License
 * found in the LICENSE file in the root directory of this source tree.
 */

import { RouteComponentProps } from "react-router";
import { Location, UnregisterCallback } from "history";

export function getMockRouterProps<P>(data: P) {
  const location: Location = {
    hash: "",
    key: "",
    pathname: "",
    search: "",
    state: {}
  };

  const props: RouteComponentProps<P> = {
    location,
    match: {
      isExact: true,
      params: data,
      path: "",
      url: ""
    },
    history: {
      location,
      length: 2,
      action: "POP",
      push: () => {},
      replace: () => {},
      go: num => {},
      goBack: () => {},
      goForward: () => {},
      block: t => null as any,
      createHref: t => "",
      listen: t => null as any
    },
    staticContext: {}
  };

  return props;
}
