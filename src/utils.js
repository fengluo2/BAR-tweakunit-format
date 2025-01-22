import fs from 'fs';
import path from 'path';

class Stack {
    items = [];

    // 入栈操作
    push(element) {
        this.items.push(element);
    }

    // 出栈操作
    pop() {
        if (this.isEmpty()) {
            return undefined; // 如果栈为空，返回 undefined
        }
        return this.items.pop();
    }

    // 查看栈顶元素
    peek() {
        if (this.isEmpty()) {
            return undefined;
        }
        return this.items[this.items.length - 1];
    }

    // 判断栈是否为空
    isEmpty() {
        return this.items.length === 0;
    }

    // 返回栈的大小
    size() {
        return this.items.length;
    }

    // 清空栈
    clear() {
        this.items = [];
    }

    // 打印栈的所有元素
    print() {
        console.log(this.items.toString());
    }
}

class Tabel {
    // 缩进级别
    indentationNum;
    indentationStr;
    // 括号栈
    bracketStack;

    constructor(indentationStr = "    ") {
        this.bracketStack = new Stack();
        this.indentationNum = 0;
        this.indentationStr = indentationStr;
    }

    // 将转义后的字符串转换为可视化方便的表格
    strToTable(str) {
        let result = '';
        let currentToken = '';
        let isInString = false;  // 用来标记当前是否在字符串内
        let charIndex = 0;

        while (charIndex < str.length) {
            let char = str[charIndex];

            // 如果是字符串开始或结束的引号
            if (char === "'" && (charIndex === 0 || str[charIndex - 1] !== '\\')) {
                isInString = !isInString;
                currentToken += char;
                charIndex++;
                continue;
            }

            // 处理括号的缩进
            if (!isInString) {
                if (char === '{') {
                    if (currentToken.trim()) {
                        result += this.getIndentation() + currentToken.trim();
                    }
                    this.bracketStack.push(char);
                    this.indentationNum++;
                    currentToken = '';
                    result += char + '\n';
                } else if (char === '}') {
                    if (currentToken.trim()) {
                        result += this.getIndentation() + currentToken.trim() + '\n';
                    }
                    this.bracketStack.pop();
                    this.indentationNum--;
                    currentToken = '';
                    result += this.getIndentation() + char;

                    // Check if the next character is a comma and add it after the closing bracket on the same line
                    if (charIndex + 1 < str.length && str[charIndex + 1] === ',') {
                        result += ',';
                        charIndex++;  // Skip the comma
                    }

                    result += '\n';  // Add newline after the closing bracket (and the comma if exists)
                } else if (char === ',') {
                    if (currentToken.trim()) {
                        result += this.getIndentation() + currentToken.trim() + ',\n';
                    }
                    currentToken = '';
                } else {
                    currentToken += char;
                }
            } else {
                currentToken += char;
            }
            charIndex++;
        }

        if (currentToken.trim()) {
            result += this.getIndentation() + currentToken.trim() + '\n';
        }

        return result.trim();
    }

    // 获取当前缩进
    getIndentation() {
        return this.indentationStr.repeat(this.indentationNum);
    }
}

function mkdirFilePath(filePath) {
    // 获取父目录路径
    const dirPath = path.dirname(filePath);

    // 判断父目录是否存在
    if (!fs.existsSync(dirPath)) {
        // 如果不存在，创建父目录（递归创建）
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function copyFile(sourcePath, targetPath) {
    mkdirFilePath(targetPath)
    fs.copyFileSync(sourcePath, targetPath);
}

const defaultBase64path = "./default/tweakunit_base64.txt";
const defaultTablePath = "./default/tweakunit_table.txt";

const base64path = "./../file/tweakunit_base64.txt";
const tablePath = "./../file/tweakunit_table.txt";

export function base64ToTableForFile(modeOptionInfo = false) {
    mkdirFilePath(tablePath)

    if (fs.existsSync(tablePath)) {
        fs.truncateSync(tablePath, 0)
    }

    if (!fs.existsSync(tablePath)) {
        copyFile(defaultBase64path, base64path);
    }

    const base64Str = fs.readFileSync(base64path, 'utf-8');

    const table = new Tabel();

    const tableZipStr = atob(base64Str)
    const index = tableZipStr.indexOf("{");

    var part1 = "";
    var part2 = "";

    if (index !== -1) {
        part1 = tableZipStr.substring(0, index);
        part2 = tableZipStr.substring(index);
    }

    fs.writeFileSync(tablePath, part1 + table.strToTable(part2), 'utf-8');
}

export function tableToBase64ForFile(modeOptionInfo = false) {
    mkdirFilePath(base64path)

    if (fs.existsSync(base64path)) {
        fs.truncateSync(base64path, 0)
    }

    if (!fs.existsSync(tablePath)) {
        copyFile(defaultTablePath, tablePath);
    }

    const table64Str = fs.readFileSync(tablePath, 'utf-8');

    const index = table64Str.indexOf("{");

    var part1 = "";
    var part2 = "";

    if (index !== -1) {
        part1 = table64Str.substring(0, index);
        part2 = table64Str.substring(index);
    }

    fs.writeFileSync(base64path, btoa(part1 + part2.replaceAll(/\n +/g, '')).replaceAll(/=+$/g, ''), 'utf-8');
}