import fs from 'fs';
import path from 'path';

type ConfigValue = string | number | boolean | null | ConfigDict;
interface ConfigDict {
    [key: string]: ConfigValue;
}

class Config {
    private readonly _configPath: string;
    private _jsonConfig: ConfigDict = {};
    private _config: ConfigDict = {};

    constructor() {
        // 定义多个可能的配置文件路径，按优先级排序
        const possiblePaths = [
            path.join(__dirname, './config.json'),
            path.join(__dirname, '../config.json'),
            path.join(__dirname, '../../config.json'),
            
        ];
        
        // 查找第一个存在的配置文件
        this._configPath = possiblePaths.find((path) => fs.existsSync(path)) || '';
        
        // 如果配置文件不存在，报错
        if (!fs.existsSync(this._configPath)) throw new Error(`配置文件不存在: ${this._configPath}`);
        console.log(`配置文件路径:${this._configPath}`)
        this._loadConfig();
    }

    /**
     * 从config.json中获取配置值
     */
    private _getFromJson(key: string): any {
        return this._getValueByPath(this._jsonConfig, key);
    }

    /**
     * 写入配置到config.json
     */
    private _writeToJson(key: string, value: any): void {
        const config = { ...this._jsonConfig };
        this._setValueByPath(config, key, value);
        fs.writeFileSync(this._configPath, JSON.stringify(config, null, 2));
        this._jsonConfig = config;
    }

    /**
     * 根据路径获取值
     */
    private _getValueByPath(obj: any, path: string): any {
        const parts = path.split('.');
        let current = obj;

        for (const part of parts) {
            if (current && typeof current === 'object') {
                current = current[part];
            } else {
                return undefined;
            }
        }

        return current;
    }

    /**
     * 根据路径设置值
     */
    private _setValueByPath(obj: any, path: string, value: any): void {
        const parts = path.split('.');
        let current = obj;

        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            // 如果当前节点不是对象，或者是null，创建一个新对象
            if (typeof current[part] !== 'object' || current[part] === null) {
                current[part] = {};
            }
            current = current[part];
        }

        // 设置最后一个节点的值
        const lastPart = parts[parts.length - 1];
        current[lastPart] = value;
    }

    /**
     * 值类型转换
     */
    private _convertValue(value: any): ConfigValue {
        // 如果不是字符串，直接返回
        if (typeof value !== 'string') {
            return value;
        }

        const lowerValue = value.toLowerCase();

        // 处理布尔值
        if (['true', 'yes', 'on', '1'].includes(lowerValue)) {
            return true;
        }
        if (['false', 'no', 'off', '0'].includes(lowerValue)) {
            return false;
        }

        // 处理None值
        if (['none', 'null'].includes(lowerValue)) {
            return null;
        }

        // 处理数字
        try {
            if (/^\d+$/.test(value)) {
                return parseInt(value, 10);
            }
            if (/^\d*\.\d+$/.test(value)) {
                const floatValue = parseFloat(value);
                return isNaN(floatValue) ? value : floatValue;
            }
        } catch {
            // 如果转换失败，返回原始字符串
        }

        return value;
    }

    /**
     * 合并配置
     */
    private _mergeConfigs(base: ConfigDict, override: ConfigDict): ConfigDict {
        const result = { ...base };

        for (const [key, value] of Object.entries(override)) {
            if (value === undefined || value === null) {
                continue;
            }

            if (
                key in result &&
                result[key] !== null &&
                typeof result[key] === 'object' &&
                typeof value === 'object'
            ) {
                result[key] = this._mergeConfigs(
                    result[key] as ConfigDict,
                    value as ConfigDict
                );
            } else {
                result[key] = value;
            }
        }

        return result;
    }

    /**
     * 获取所有配置
     */
    public getAll(): ConfigDict {
        return { ...this._config };
    }

    /**
     * 加载JSON配置文件
     */
    private _loadJsonConfig(): void {
        if (fs.existsSync(this._configPath)) {
            try {
                const content = fs.readFileSync(this._configPath, 'utf-8');
                this._jsonConfig = JSON.parse(content);
            } catch (error) {
                this._jsonConfig = {};
            }
        }
    }

    /**
     * 重新加载配置
     */
    private _loadConfig(): void {
        // 加载配置
        this._loadJsonConfig();
        // 直接使用JSON配置
        this._config = { ...this._jsonConfig };
    }

    /**
     * 重新加载配置
     */
    public reload(): void {
        this._loadConfig();
    }

    /**
     * 获取配置值
     */
    public get<T>(key: string, defaultValue?: T): T {
        if (!key) {
            return defaultValue as T;
        }

        // 从JSON配置获取值
        const value = this._getFromJson(key);
        return value !== undefined ? value as T : (defaultValue as T);
    }

    /**
     * 设置配置值
     */
    public set(key: string, value: any): void {
        // 写入配置到config.json
        if (fs.existsSync(this._configPath)) {
            this._writeToJson(key, value);
        }

        // 重新加载配置
        this._loadConfig();
    }
}

// 创建全局配置实例
export const config = new Config();
