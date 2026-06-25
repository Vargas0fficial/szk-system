module.exports = {
    apps: [
        {
            name: "pang",
            script: "node",
            args: "node_modules/next/dist/bin/next start -p 3000",
            cwd: "C:\\Users\\DELL\\Desktop\\szk-system",
            env: {
                NODE_ENV: "production",
            }
        },
        {
            name: "launion",
            script: "node",
            args: "node_modules/next/dist/bin/next start -p 3001",
            cwd: "C:\\Users\\DELL\\Desktop\\szk-launion",
            env: {
                NODE_ENV: "production",
            }
        },
        {
            name: "tarlac",
            script: "node",
            args: "node_modules/next/dist/bin/next start -p 3002",
            cwd: "C:\\Users\\DELL\\Desktop\\szk-tarlac",
            env: {
                NODE_ENV: "production",
            }
        },
    ],
};