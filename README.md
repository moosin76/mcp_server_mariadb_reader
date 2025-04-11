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

이 서버를 사용하려면 GitHub 저장소를 클론하고, MCP 클라이언트(예: VS Code 확장 프로그램)의 설정 파일에 서버 정보를 등록해야 합니다. 이 저장소에는 미리 빌드된 실행 파일(`build/index.js`)이 포함되어 있어 별도의 빌드 과정이 필요하지 않습니다.

1.  **저장소 클론:** 원하는 위치에 이 저장소를 클론합니다.
    ```bash
    git clone https://github.com/moosin76/mcp_server_mariadb_reader.git
    ```
2.  **MCP 설정 파일 수정:**

**설정 예시:**

```json
{
  "mcpServers": {
    "mcp_server_mariadb_reader": {
      "command": "node",
      "args": ["<클론된 저장소 경로>/build/index.js"], // 클론된 저장소 내 build/index.js 파일 경로
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

*   `<클론된 저장소 경로>` 부분을 실제 저장소를 클론한 로컬 경로로 변경해야 합니다. (예: `C:/Users/YourUser/Documents/GitHub/mcp_server_mariadb_reader`)
*   `env` 객체 내의 MariaDB 연결 정보를 실제 환경에 맞게 수정해야 합니다.

## 개발 (소스 코드 수정 시)

이 저장소에는 빌드된 파일이 포함되어 있으므로, 서버를 사용하기 위해 아래 단계를 수행할 필요는 없습니다. 소스 코드(`src` 디렉토리)를 직접 수정하고 변경 사항을 적용하려면 다음 단계를 따르세요.

1.  **의존성 설치 (최초 한 번 또는 `package.json` 변경 시):**
    ```bash
    npm install
    ```
2.  **수정 후 빌드:**
    ```bash
    npm run build
    ```
    *   이 명령은 `src` 디렉토리의 TypeScript 코드를 `build` 디렉토리의 JavaScript 코드로 컴파일합니다.
3.  **(선택) 개발 중 변경 사항 감지 및 자동 빌드:**
    ```bash
    npm run watch
    ```

## 라이선스

이 프로젝트는 [라이선스 정보 입력] 라이선스 하에 배포됩니다.
