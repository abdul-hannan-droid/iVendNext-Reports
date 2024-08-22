import frappe


@frappe.whitelist()
def save_dashboard(file_name, json_data):
    if frappe.db.exists(
        "Stimulsoft Dashboard",
        file_name,
    ):
        dashboard = frappe.get_doc("Stimulsoft Dashboard", file_name)
        dashboard.dashboard_name = file_name
        dashboard.json_data = json_data
        dashboard.save()
    else:
        frappe.get_doc(
            {
                "doctype": "Stimulsoft Dashboard",
                "dashboard_name": file_name,
                "json_data": json_data,
            }
        ).insert()


@frappe.whitelist()
def fetch_dashboard_list():
    return frappe.db.get_list(
        "Stimulsoft Dashboard",
    )


@frappe.whitelist()
def get_single_dashboard(name):
    return frappe.get_doc("Stimulsoft Dashboard", name)


@frappe.whitelist()
def get_config():
    return frappe.get_site_config()


@frappe.whitelist()
def get_datasources():
    doctypes = []
    for doctype in frappe.get_list("Stimulsoft Datasource"):
        doctypes.append(frappe.get_cached_doc("Stimulsoft Datasource", doctype.name))
    return doctypes


# appname-> ivendnext-reports
