import { Plugin, TFile } from "obsidian";
// import { Plugin, MarkdownView, Notice, App } from "obsidian";

export default class TagJournalButtonsPlugin extends Plugin {
	async onload() {
		// create buttons from "togglebutton" codeblocks in preview editor view
		this.registerMarkdownCodeBlockProcessor(
			"togglebutton",
			async (source, el, ctx) => {
				// create a button html element
				const button = this.createButton(source, el);

				// TODO add the "mod-cta" class to any buttons whose
				// file properties are true at page load

				// replace the codeblock with that button element
				el.replaceWith(button);
			}
		);

		// create buttons from "togglebutton" codeblocks in reading view
		this.registerMarkdownPostProcessor(async (el, ctx) => {
			// Search for <code> blocks inside this element
			// in this case, the element defaults to the page container
			const codeblocks = el.findAll("code");

			// we want to process only the codeblocks that are supposed to
			// be used by this plugin. we have to loop over all of them
			for (const codeblock of codeblocks) {
				// get the text from inside the codeblock
				const text = codeblock.innerText.trim();

				// for each codeblock, if it has the flag "togglebutton", process it
				if (text.startsWith("togglebutton")) {
					// create a button html element
					const button = this.createButton(text, el);

					// TODO add the "mod-cta" class to any buttons whose
					// file properties are true at page load

					// replace the codeblock with that button element
					codeblock.replaceWith(button);
				}
			}
		});
	}

	private getArgs(source: string) {
		// the text (source) inside our codeblock is just a string, but we need
		// something we can work with, so build an object from it.

		// create an array from the source string by splitting it at line breaks
		const split = source.trim().split("\n");

		// init an empty object to fill with our source's key-value pairs
		const args: { [key: string]: string } = {};

		// build an object of key value pairs from each element of the split array
		for (const line of split) {
			// split each line at the colon
			const keyValuePair: string[] = line.split(":");

			// the first element will be the key of the property
			const key: string = keyValuePair[0].toLowerCase().trim();

			// the second element will be the value of the property
			const value: string = keyValuePair[1].trim();

			// add that key and value to our object
			args[key] = value;
		}

		// return the completed object
		return args;
	}

	/**
	 * a function to get the current value of a boolean file property
	 *
	 * @return  {Promise<boolean>}  the value of the property
	 */
	private async getFileProperty(
		file: TFile,
		propertyName: string
	): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			this.app.fileManager.processFrontMatter(file, (frontmatter) => {
				const propertyValue = frontmatter[propertyName];
				if (typeof propertyValue === "boolean") {
					resolve(propertyValue);
				} else {
					resolve(false);
				}
			});
		});
	}

	/**
	 * a function to toggle the value of a boolean file property and
	 * return its new value
	 *
	 * @return  {Promise<boolean>}  the new value of the property
	 */
	private async toggleFileProperty(
		file: TFile,
		propertyName: string
	): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			this.app.fileManager.processFrontMatter(file, (frontmatter) => {
				const propertyValue = frontmatter[propertyName];
				if (typeof propertyValue === "boolean") {
					frontmatter[propertyName] = !propertyValue;
					resolve(!propertyValue);
				} else {
					resolve(false);
				}
			});
		});
	}

	private createButton(args: string, el: HTMLElement): HTMLElement {
		// get the current file. we need it in order to interact with file properties
		// and if we can't get it, abort the whole function;
		const file = this.app.workspace.getActiveFile();

		if (file) {
			// parse the arguments
			const argsObject = this.getArgs(args);

			// assign the property name to a var for convenience
			const propertyName = argsObject.property;

			//create the button element
			const button = el.createEl("button", {
				text: argsObject.label,
				cls: ["tag-toggle-button"],
			});

			// if the button codeblock includes an id value, add it as the button's id
			if (argsObject.id) {
				button.setAttribute("id", argsObject.id);
			}

			// if the button config includes the name of a property to toggle
			// add a click handler to the button
			if (propertyName) {
				button.on("click", "button", async () => {
					// toggleFileProperty toggles the given property and returns its new value
					// or returns false if the property doesn't exist
					const newPropertyValue = await this.toggleFileProperty(
						file,
						propertyName
					);

					// console.log("newPropertyValue", newPropertyValue);

					if (newPropertyValue) {
						// if the new property value is true, add the native button class "mod-cta"
						// to change its appearance to look active
						button.classList.add("mod-cta");
					} else {
						// if the new property value is false, remove that class
						button.classList.remove("mod-cta");
					}
				});
			}

			return button;
		}

		// if the current file is null, output an error message.
		return el.createEl("span", {
			text: "togglebutton error: active file is null",
		});
	}
}
