/**
 * EntE
 * (c) 2017-present, Simon Knott <info@simonknott.de>
 *
 * This source code is licensed under the GNU Affero General Public License
 * found in the LICENSE file in the root directory of this source tree.
 */

import * as React from "react";
import { ImportUsers } from "./ImportUsers";
import { shallow } from "enzyme";

describe("ImportUsers", () => {
  const addMessage = jest.fn();
  const onClose = jest.fn();
  const createUsers = jest.fn();
  const comp = shallow(
    <ImportUsers
      addMessage={addMessage}
      show
      onClose={onClose}
      fullScreen
      createUsers={createUsers}
      usernames={[]}
    />
  );

  it("renders correctly", () => {
    const comp = shallow(
      <ImportUsers
        addMessage={addMessage}
        show
        onClose={onClose}
        fullScreen
        createUsers={createUsers}
        usernames={[]}
      />
    );

    expect(comp).toMatchSnapshot();
  });

  it("closes on clicking close", () => {
    comp.find(".close").simulate("click");
    expect(onClose).toHaveBeenCalled();
  });

  describe("when not added users", () => {
    it("doesn't submit", () => {
      comp.find(".submit").simulate("click");
      expect(createUsers).not.toHaveBeenCalled();
    });
  });
});