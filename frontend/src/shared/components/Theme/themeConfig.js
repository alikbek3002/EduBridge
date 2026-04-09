import { createTheme } from '@mantine/core';

const theme = createTheme({
	primaryColor: 'blue',
	fontFamily: 'Inter, system-ui, sans-serif',
	fontFamilyMonospace: 'Monaco, Courier, monospace',
	headings: { fontFamily: 'Inter, system-ui, sans-serif' },
	defaultRadius: 'md',
	colors: {
		brand: [
			'#e7f5ff',
			'#d0ebff',
			'#a5d8ff',
			'#74c0fc',
			'#4dabf7',
			'#339af0',
			'#228be6',
			'#1c7ed6',
			'#1971c2',
			'#1864ab'
		]
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
				shadow: 'sm',
			},
		},
		Card: {
			defaultProps: {
				radius: 'md',
				shadow: 'sm',
			},
		},
		TextInput: {
			defaultProps: {
				radius: 'md',
				size: 'md',
				variant: 'filled',
			},
		},
		Select: {
			defaultProps: {
				radius: 'md',
				size: 'md',
				variant: 'filled',
				searchable: true,
			},
		},
		MultiSelect: {
			defaultProps: {
				radius: 'md',
				size: 'md',
				variant: 'filled',
				searchable: true,
			},
		},
		Textarea: {
			defaultProps: {
				radius: 'md',
				size: 'md',
				variant: 'filled',
				autosize: true,
			},
		},
		FileInput: {
			defaultProps: {
				radius: 'md',
				size: 'md',
				variant: 'filled',
			},
		},
	},
});

export default theme; 