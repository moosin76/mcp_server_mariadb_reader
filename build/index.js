#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode, } from "@modelcontextprotocol/sdk/types.js";
import mysql from 'mysql2/promise'; // 비동기/await 지원을 위해 mysql2/promise 사용
// --- MariaDB 연결 설정 ---
// 이 값들은 MCP 설정에서 제공하는 환경 변수로부터 채워집니다.
const dbConfig = {
    host: process.env.MARIADB_HOST || 'localhost', // 호스트 주소 (기본값: localhost)
    port: process.env.MARIADB_PORT ? parseInt(process.env.MARIADB_PORT, 10) : 3306, // 포트 번호 (기본값: 3306)
    user: process.env.MARIADB_USER, // 사용자 이름 (필수)
    password: process.env.MARIADB_PASSWORD, // 비밀번호 (선택)
    database: process.env.MARIADB_DATABASE, // 기본 데이터베이스 (선택)
};
// 필수 환경 변수 기본 검증
if (!dbConfig.user) {
    console.error("MARIADB_USER 환경 변수가 필요합니다.");
    process.exit(1);
    // 가능하다면 MCP 클라이언트가 이해할 수 있는 오류를 발생시키는 것을 고려
}
// 비밀번호는 DB 설정에 따라 선택 사항일 수 있으므로 엄격한 검사는 하지 않음
/**
 * 데이터베이스 연결을 생성하는 헬퍼 함수.
 * 사용 후에는 반드시 연결을 닫아야 합니다.
 * @param dbName - 연결할 특정 데이터베이스 이름 (선택 사항)
 * @returns 생성된 데이터베이스 연결 객체
 */
async function createDbConnection(dbName) {
    try {
        const connection = await mysql.createConnection({
            ...dbConfig,
            database: dbName || dbConfig.database, // 특정 DB가 제공되면 사용, 아니면 기본값 사용
        });
        return connection;
    }
    catch (error) {
        console.error("데이터베이스 연결 오류:", error.message);
        // MCP 클라이언트에게 더 구체적인 오류 제공
        throw new McpError(ErrorCode.InternalError, `데이터베이스 연결 실패: ${error.message}`);
    }
}
/**
 * MCP 서버 인스턴스 생성.
 */
const server = new Server({
    // 이름과 설명은 create-server 단계에서 제공됨
    name: "mcp_server_mariadb_reader",
    version: "0.1.0",
    description: "MCP server mariadb reader" // 제공된 설명과 일치
}, {
    capabilities: {
        // 이 버전에서는 도구만 구현됨
        tools: {},
    },
});
/**
 * 사용 가능한 MariaDB 도구 목록을 반환하는 핸들러.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "list_databases",
                description: "접근 가능한 모든 데이터베이스 목록을 보여줍니다.",
                inputSchema: { type: "object", properties: {} } // 입력 필요 없음
            },
            {
                name: "list_tables",
                description: "특정 데이터베이스 내의 모든 테이블 목록을 보여줍니다.",
                inputSchema: {
                    type: "object",
                    properties: {
                        database: { type: "string", description: "데이터베이스의 이름입니다." }
                    },
                    required: ["database"]
                }
            },
            {
                name: "get_table_schema",
                description: "특정 테이블의 스키마(컬럼 정의)를 가져옵니다.",
                inputSchema: {
                    type: "object",
                    properties: {
                        database: { type: "string", description: "데이터베이스의 이름입니다." },
                        table: { type: "string", description: "테이블의 이름입니다." }
                    },
                    required: ["database", "table"]
                }
            },
            {
                name: "query_table",
                description: "특정 테이블에서 데이터를 조회합니다 (제한된 행 반환).",
                inputSchema: {
                    type: "object",
                    properties: {
                        database: { type: "string", description: "데이터베이스의 이름입니다." },
                        table: { type: "string", description: "테이블의 이름입니다." },
                        limit: { type: "number", description: "반환할 최대 행 수 (기본값 100).", default: 100 },
                        // 향후 개선: where_clause, columns, order_by 등 추가
                    },
                    required: ["database", "table"]
                }
            }
        ]
    };
});
/**
 * MariaDB 도구를 실행하는 핸들러.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    let connection = null; // 연결 객체 초기화
    const args = request.params.arguments || {}; // 인자 객체 (없으면 빈 객체)
    try {
        switch (request.params.name) {
            case "list_databases": {
                connection = await createDbConnection(); // 특정 DB 없이 연결
                const [rows] = await connection.query('SHOW DATABASES;'); // 데이터베이스 목록 조회 쿼리
                // 결과를 JSON 문자열로 변환하여 반환 (가독성을 위해 null, 2 사용)
                return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
            }
            case "list_tables": {
                const dbName = args.database; // 데이터베이스 이름 추출
                if (!dbName)
                    throw new McpError(ErrorCode.InvalidParams, "필수 파라미터 누락: database");
                connection = await createDbConnection(dbName); // 지정된 DB로 연결
                // 테이블 목록 조회 쿼리 (백틱 사용은 안전하지만 SHOW TABLES에서는 필수는 아님)
                const [rows] = await connection.query(`SHOW TABLES;`);
                return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
            }
            case "get_table_schema": {
                const dbName = args.database; // 데이터베이스 이름 추출
                const tableName = args.table; // 테이블 이름 추출
                if (!dbName)
                    throw new McpError(ErrorCode.InvalidParams, "필수 파라미터 누락: database");
                if (!tableName)
                    throw new McpError(ErrorCode.InvalidParams, "필수 파라미터 누락: table");
                connection = await createDbConnection(dbName); // 지정된 DB로 연결
                // 테이블 스키마 조회 쿼리 (예약어 또는 특수문자 가능성을 위해 백틱 사용)
                const [rows] = await connection.query(`DESCRIBE \`${tableName}\`;`);
                return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
            }
            case "query_table": {
                const dbName = args.database; // 데이터베이스 이름 추출
                const tableName = args.table; // 테이블 이름 추출
                // 반환할 행 수 제한 (기본값 100)
                const limit = typeof args.limit === 'number' && args.limit > 0 ? args.limit : 100;
                if (!dbName)
                    throw new McpError(ErrorCode.InvalidParams, "필수 파라미터 누락: database");
                if (!tableName)
                    throw new McpError(ErrorCode.InvalidParams, "필수 파라미터 누락: table");
                connection = await createDbConnection(dbName); // 지정된 DB로 연결
                // 데이터 조회 쿼리 (안전을 위해 백틱 사용 및 LIMIT 적용)
                const query = `SELECT * FROM \`${tableName}\` LIMIT ?;`;
                const [rows] = await connection.query(query, [limit]); // 쿼리 실행 (limit 값 바인딩)
                return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
            }
            default:
                // 알려지지 않은 도구 요청 시 오류 발생
                throw new McpError(ErrorCode.MethodNotFound, `알 수 없는 도구: ${request.params.name}`);
        }
    }
    catch (error) {
        // 도구 실행 중 발생한 오류 로깅
        console.error(`도구 ${request.params.name} 실행 오류:`, error.message);
        // 이미 McpError 인스턴스인지 확인, 아니면 래핑
        if (error instanceof McpError) {
            throw error;
        }
        // 잠재적인 MySQL 오류를 구체적으로 처리
        if (error.sqlMessage) {
            throw new McpError(ErrorCode.InternalError, `데이터베이스 쿼리 실패: ${error.sqlMessage} (코드: ${error.code})`);
        }
        // 일반적인 내부 오류
        throw new McpError(ErrorCode.InternalError, `도구 ${request.params.name} 실행 실패: ${error.message}`);
    }
    finally {
        // 연결이 생성되었다면 항상 닫도록 보장
        if (connection) {
            await connection.end();
        }
    }
});
// --- 서버 시작 ---
async function main() {
    // 오류 처리 설정
    server.onerror = (error) => console.error('[MCP 서버 오류]', error);
    // SIGINT (Ctrl+C) 및 SIGTERM 신호 처리하여 정상 종료
    process.on('SIGINT', async () => {
        console.log("서버 종료 중...");
        await server.close();
        process.exit(0);
    });
    process.on('SIGTERM', async () => {
        console.log("서버 종료 중...");
        await server.close();
        process.exit(0);
    });
    // 표준 입출력(stdio) 전송 계층 사용
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // 서버 실행 로그는 stderr로 출력하여 stdout JSON 통신 방해 방지
    console.error('MariaDB 리더 MCP 서버가 stdio에서 실행 중입니다.');
}
// 주 함수 실행 및 오류 처리
main().catch((error) => {
    console.error("서버 시작 실패:", error);
    process.exit(1);
});
