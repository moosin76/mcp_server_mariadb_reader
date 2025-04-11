# MariaDB Reader MCP Server

This project is a Model Context Protocol (MCP) server designed for exploring and interacting with MariaDB databases. It provides tools for AI assistants like Cline to access and retrieve information from MariaDB databases.

## Features

This MCP server offers the following tools:

*   **`list_databases`**: Returns a list of all accessible databases.
*   **`list_tables`**: Returns a list of all tables within a specified database.
    *   Input: `database` (string, required) - The name of the database to list tables from.
*   **`get_table_schema`**: Returns the schema (column definitions) of a specified table.
    *   Input:
        *   `database` (string, required) - The name of the database the table belongs to.
        *   `table` (string, required) - The name of the table to retrieve the schema for.
*   **`query_table`**: Queries data from a specified table. By default, it returns the first 100 rows.
    *   Input:
        *   `database` (string, required) - The name of the database the table belongs to.
        *   `table` (string, required) - The name of the table to query data from.
        *   `limit` (number, optional) - The maximum number of rows to return (default: 100).

## Setup

To use this server, you need to clone the GitHub repository and register the server information in the settings file of your MCP client (e.g., the VS Code extension). This repository includes the pre-built executable file (`build/index.js`), so no separate build process is required.

1.  **Clone the Repository:** Clone this repository to your desired location.
    ```bash
    git clone https://github.com/moosin76/mcp_server_mariadb_reader.git
    ```
2.  **Modify MCP Settings File:**

    **Example Settings File Path (VS Code):**
    ```
    c:\Users\<YourUsername>\AppData\Roaming\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
    ```

    **Example Configuration:**
    ```json
    {
      "mcpServers": {
        "mcp_server_mariadb_reader": { // Note: The key might be 'mariadb-reader' depending on previous setup
          "command": "node",
          "args": ["<path_to_cloned_repo>/build/index.js"], // Path to build/index.js within the cloned repository
          "env": {
            "MARIADB_HOST": "YOUR_DB_HOST",         // MariaDB host address
            "MARIADB_PORT": "YOUR_DB_PORT",         // MariaDB port number (e.g., "3306")
            "MARIADB_USER": "YOUR_DB_USER",         // MariaDB username
            "MARIADB_PASSWORD": "YOUR_DB_PASSWORD", // MariaDB password
            "MARIADB_DATABASE": "YOUR_DEFAULT_DB"   // (Optional) Default database name
          },
          "disabled": false,
          "autoApprove": []
        }
        // Other MCP server configurations...
      }
    }
    ```

    **Note:**
    *   Replace `<path_to_cloned_repo>` with the actual local path where you cloned the repository (e.g., `C:/Users/YourUser/Documents/GitHub/mcp_server_mariadb_reader`).
    *   Modify the MariaDB connection details within the `env` object to match your environment.

## Development (When Modifying Source Code)

Since this repository includes the built files, you do not need to perform the steps below just to use the server. Follow these steps only if you want to modify the source code (`src` directory) and apply your changes.

1.  **Install Dependencies (Once initially or when `package.json` changes):**
    ```bash
    npm install
    ```
2.  **Build After Modifications:**
    ```bash
    npm run build
    ```
    *   This command compiles the TypeScript code in the `src` directory into JavaScript code in the `build` directory.
3.  **(Optional) Watch for Changes and Auto-Build During Development:**
    ```bash
    npm run watch
    ```

## License

This project is distributed under the [Enter License Information] license.
