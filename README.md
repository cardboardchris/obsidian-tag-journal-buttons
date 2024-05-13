# Obsidian Tag-Journaling Buttons Plugin

Create buttons that toggle boolean properties of the file they are in.

## How to Use

1. Add a codeblock with the language identifier "togglebutton"
1. Include arguments for your button.
	- Required arguments are:
    	- label: the text that will appear in the button
    	- property: the file property to toggle
	- Optional arguments:
		- id: a string to assign to the button's id attribute

### Example

````
```togglebutton
label: my button
id: my-button
property: my-boolean-file-property
```
````

This example codeblock will create a button with id="my-button" and the text "my button" on it.

Clicking the button will toggle the property "my-boolean-file-property" if it exists and is boolean.

If clicking the button caused the property to become true, the button will gain a class that applies styles to make it appear active. If clicking the button caused the property to become false, the button will lose that class and the corresponding styles.
