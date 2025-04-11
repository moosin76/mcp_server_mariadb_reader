# MariaDB Reader MCP Server

이 프로젝트는 MariaDB 데이터베이스를 탐색하고 상호작용하기 위한 Model Context Protocol (MCP) 서버입니다. 이 서버는 Cline과 같은 AI 어시스턴트가 MariaDB 데이터베이스에 접근하여 정보를 조회할 수 있도록 도구를 제공합니다.

## 기능

이 MCP 서버는 다음과 같은 도구를 제공합니다:

*   **`list_databases`**: 접근 가능한 모든 데이터베이스의 목록을 반환합니다.
*   **`list_tables`**: 지정된 데이터베이스 내의 모든 테이블 목록을 반환합니다.
    *   입력: `database` (문자열, 필수) - 테이블 목록을 조회할 데이터베이스 이름.
*   **`get_table_schema`**: 지정된 테이블의 스키마(컬럼 정의)를 반환합니다.
    *   입력:
        *   `database` (문자열, 필수) - 테이블이 속한 데이터베이스 이름.
        *   `table` (문자열, 필수) - 스키마를 조회할 테이블 이름.
*   **`query_table`**: 지정된 테이블에서 데이터를 조회합니다. 기본적으로 처음 100개의 행을 반환합니다.
    *   입력:
        *   `database` (문자열, 필수) - 테이블이 속한 데이터베이스 이름.
        *   `table` (문자열, 필수) - 데이터를 조회할 테이블 이름.
        *   `limit` (숫자, 선택) - 반환할 최대 행 수 (기본값: 100).

## 설정

이 서버를 사용하려면 MCP 클라이언트(예: VS Code 확장 프로그램)의 설정 파일에 서버 정보를 등록해야 합니다.

**설정 파일 경로 (VS Code 예시):**

```
c:\Users\<사용자명>\AppData\Roaming\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
```

**설정 예시:**

```json
{
  "mcpServers": {
    "mariadb-reader": {
      "command": "node",
      "args": ["<프로젝트 경로>/mariadb-reader-server/build/index.js"], // 실제 빌드된 index.js 파일 경로로 수정
      "env": {
        "MARIADB_HOST": "YOUR_DB_HOST",         // MariaDB 호스트 주소
        "MARIADB_PORT": "YOUR_DB_PORT",         // MariaDB 포트 번호 (예: "3306")
        "MARIADB_USER": "YOUR_DB_USER",         // MariaDB 사용자 이름
        "MARIADB_PASSWORD": "YOUR_DB_PASSWORD", // MariaDB 비밀번호
        "MARIADB_DATABASE": "YOUR_DEFAULT_DB"   // (선택) 기본 데이터베이스 이름
      },
      "disabled": false,
      "autoApprove": []
    }
    // 다른 MCP 서버 설정...
  }
}
```

**주의:**

*   `<프로젝트 경로>` 부분을 실제 `mariadb-reader-server` 프로젝트가 위치한 전체 경로로 변경해야 합니다. (예: `c:/Data/Work/Ampm/Site/MCP/mcp_server_mariadb_reader`)
*   `env` 객체 내의 MariaDB 연결 정보를 실제 환경에 맞게 수정해야 합니다.

## 개발

1.  **의존성 설치:**
    ```bash
    npm install
    ```
2.  **빌드:**
    ```bash
    npm run build
    ```
3.  **(선택) 변경 사항 감지 및 자동 빌드:**
    ```bash
    npm run watch
    ```

## 라이선스

이 프로젝트는 [라이선스 정보 입력] 라이선스 하에 배포됩니다.
