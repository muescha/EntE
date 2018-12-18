import * as Handlebars from "handlebars";
import moment = require("moment");
import { WeeklySummaryOptions, WeeklySummaryRowData } from "./WeeklySummary";

const tableRow = (data: WeeklySummaryRowData) => `
  <tr>
    <td>${data.displayname}</td>
    <td>${data.date.toDateString()}</td>
    <td>${data.hour_from}</td>
    <td>${data.hour_to}</td>
    <td>${data.signed ? "Excused" : "Pending"}</td>
  </tr>
`;

const template: HandlebarsTemplateDelegate<
  WeeklySummaryOptions
> = Handlebars.compile(`
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>

        <mj-divider border-color="black" />

        <mj-text font-size="20px" font-family="helvetica">
          Weekly Summary
        </mj-text>
        {{#if items.length}}    
          <mj-table>
            <tr style="border-bottom:1px solid #ecedee;text-align:left;padding:15px 0;">
              <th>Student</th>
              <th>Date</th>
              <th>From</th>
              <th>To</th>
              <th>State</th>
            </tr>
            {{#each items}}
              {{{ this }}}
            {{/each}}
          </mj-table>
        {{else}}
          <mj-text>
            There have been no absences in your classes during the last week.
          </mj-text>
        {{/if}}
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`);

const getTitle = () => `Weekly Summary cw${moment().week()}`;

export const WeeklySummaryEN = {
  getTitle,
  template,
  tableRow
};
