frappe.pages["Stimulsoft Dashboard Viewer"].on_page_load = (wrapper) => {
  frappe.viewer = new Viewer(wrapper);
};

class Viewer {
  constructor(parent) {
    frappe.ui.make_app_page({
      parent: parent,
      title: "Dashboard Viewer",
      single_column: false,
      card_layout: true,
    });
    this.parent = parent;
    this.page = this.parent.page;
    this.page.sidebar.html(
      `<ul class="standard-sidebar overlay-sidebar viewer-sidebar"></ul>`
    );
    this.$sidebar_list = this.page.sidebar.find("ul");

    StiOptions.WebServer.url = "http://localhost:9615";
    this.make();
  }

  make() {
    this.$container = $(
      `<div id="page-main-content" class="page-main-content"><div class="flex justify-center align-center text-muted" style="height: 75vh">Please Select a Dashboard</div></div>`
    ).appendTo(this.page.main);

    frappe.call({
      method: "frappe.client.get_list",
      args: {
        doctype: "Stimulsoft Dashboard",
        fieldname: ["*"],
      },
      callback: (r) => {
        r.message.forEach((element) => {
          this.get_sidebar_item(element.name).appendTo(this.$sidebar_list);
        });
      },
    });
  }

  get_sidebar_item(name) {
    const listItem = $(`<li class="standard-sidebar-item">
				  <a class="sidebar-link">
				  <span>${name}</span>
				  </a>
				  </li>`);
    listItem.find("a").on("click", () => {
      this.load_report(name);
    });
    return listItem;
  }

  load_report(report_name) {
    frappe.call({
      method: "frappe.client.get_value",
      args: {
        doctype: "Stimulsoft Dashboard",
        filters: { name: report_name },
        fieldname: ["json_data"],
      },
      callback: (r) => {
        var report = new Stimulsoft.Report.StiReport();
        report.load(JSON.parse(r.message.json_data));
        var options = new Stimulsoft.Viewer.StiViewerOptions();
        options.appearance.scrollbarsMode = true;
        this.viewer1 = new Stimulsoft.Viewer.StiViewer(
          options,
          "StiViewer",
          false
        );
        this.viewer1.report = report;
        this.viewer1.renderHtml("page-main-content");
      },
    });
  }
}
