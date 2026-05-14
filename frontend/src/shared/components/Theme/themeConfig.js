import { createTheme } from '@mantine/core';

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const MONO_SCALE = [
	'#f9fafb',
	'#f3f4f6',
	'#e5e7eb',
	'#d1d5db',
	'#9ca3af',
	'#6b7280',
	'#374151',
	'#1f2937',
	'#111827',
	'#030712'
];

const theme = createTheme({
	primaryColor: 'dark',
	primaryShade: 9,
	fontFamily: SYSTEM_FONT,
	fontFamilyMonospace: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
	headings: { fontFamily: SYSTEM_FONT, fontWeight: '600' },
	defaultRadius: 'md',
	black: '#111111',
	white: '#ffffff',
	colors: {
		brand: MONO_SCALE,
		blue: MONO_SCALE,
		green: MONO_SCALE,
		orange: MONO_SCALE,
		purple: MONO_SCALE,
		cyan: MONO_SCALE,
		teal: MONO_SCALE,
		indigo: MONO_SCALE,
		pink: MONO_SCALE,
		yellow: MONO_SCALE,
		red: MONO_SCALE,
		grape: MONO_SCALE,
		violet: MONO_SCALE,
		lime: MONO_SCALE
	},
	components: {
		Button: {
			defaultProps: {
				radius: 'md',
				size: 'md',
			},
		},
		Paper: {
			defaultProps: {
				radius: 'md',
				shadow: 'none',
				withBorder: true,
			},
		},
		Card: {
			defaultProps: {
				radius: 'md',
				shadow: 'none',
				withBorder: true,
			},
		},
		TextInput: {
			defaultProps: {
				radius: 'md',
				size: 'md',
				variant: 'default',
			},
		},
		Select: {
			defaultProps: {
				radius: 'md',
				size: 'md',
				variant: 'default',
				searchable: true,
			},
		},
		MultiSelect: {
			defaultProps: {
				radius: 'md',
				size: 'md',
				variant: 'default',
				searchable: true,
			},
		},
		Textarea: {
			defaultProps: {
				radius: 'md',
				size: 'md',
				variant: 'default',
				autosize: true,
			},
		},
		FileInput: {
			defaultProps: {
				radius: 'md',
				size: 'md',
				variant: 'default',
			},
		},
	},
});

export default theme;
