import generateCSV from './index.js';

/**
 * 第一种
 * @author Prk<code@imprk.me>
 */

generateCSV([
    { name: '张三', age: 88, other: '我操' },
    { name: '李四', age: 99, other: '垃圾' }
]);

// name age other
// 张三 88 我操
// 李四 99 垃圾

/**
 * 第二种
 * @author Prk<code@imprk.me>
 */
generateCSV([
    { name: '张三', age: 88, other: '我操' },
    { name: '李四', age: 99, other: '垃圾' }
], {
    name: '姓名',
    age: '年龄',
    other: '其它'
});

// 姓名 年龄 其它
// 张三 88 我操
// 李四 99 垃圾

/**
 * 第三种
 * @author Prk<code@imprk.me>
 */
generateCSV([
    { name: '张三', age: 88, other: '我操' },
    { name: '李四', age: 99, other: '垃圾' }
], {
    name: '姓名',
    age: '年龄',
    other: '其它'
}, [
    'other'
]);

// 姓名 年龄
// 张三 88
// 李四 99
