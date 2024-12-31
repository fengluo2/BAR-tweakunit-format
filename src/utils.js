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

export function base64ToTableForFile(base64) {
    const filePath = "./../out/tweakunit_table.txt";

    mkdirFilePath(filePath)

    if (fs.existsSync(filePath)) {
        fs.truncateSync(filePath, 0)
    }

    const writerStream = fs.createWriteStream(filePath);
    const table = new Tabel();
    writerStream.write(table.strToTable(atob(base64)));
    writerStream.end();
}

export function tableToBase64ForFile(tabel) {
    const filePath = "./../out/tweakunit_base64.txt";

    mkdirFilePath(filePath)

    if (fs.existsSync(filePath)) {
        fs.truncateSync(filePath, 0)
    }

    const writerStream = fs.createWriteStream(filePath);
    writerStream.write(btoa(tabel.replaceAll('\n', '').replaceAll(' ', '')));
    writerStream.end();
}