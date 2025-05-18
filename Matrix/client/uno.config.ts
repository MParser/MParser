/**
 * UnoCSS configuration
 */

import { defineConfig, presetWind4 } from 'unocss';
import type { CSSObject } from 'unocss';

export default defineConfig({
    presets: [
        presetWind4()
    ],
    rules: [
        /**
         * Margin 通用规则
         * @author Prk<code@imprk.me>
         */
        [/^m-([\d-]+)(px|rem|em|vw|vh|%)?$/, ([, values, unit]): CSSObject => {
            const nums = values.split('-').map(Number);
            if (4 < nums.length) return {}; // 限制最多 4 个值
            return {
                margin: nums.map(
                    (n: number): string => (unit ? `${n}${unit}` : `${n}`)
                ).join(' ')
            };
        }],

        /**
         * Padding 通用规则
         * @author Prk<code@imprk.me>
         */
        [/^p-([\d-]+)(px|rem|em|vw|vh|%)?$/, ([, values, unit]): CSSObject => {
            const nums = values.split('-').map(Number);
            if (4 < nums.length) return {}; // 限制最多 4 个值
            return {
                padding: nums.map(
                    (n: number): string => (unit ? `${n}${unit}` : `${n}`)
                ).join(' ')
            };
        }]
    ]
});
