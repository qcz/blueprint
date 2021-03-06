/*
 * Copyright 2016 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the terms of the LICENSE file distributed with this project.
 */

import { Classes, setHotkeysDialogProps } from "@blueprintjs/core";
import { IPackageInfo } from "@blueprintjs/docs-data";
import { Banner, Documentation, IDocumentationProps, INavMenuItemProps, NavMenuItem } from "@blueprintjs/docs-theme";
import classNames from "classnames";
import { isPageNode, ITsDocBase } from "documentalist/dist/client";
import * as React from "react";
import { NavHeader } from "./navHeader";
import { NavIcon } from "./navIcons";

const DARK_THEME = Classes.DARK;
const LIGHT_THEME = "";
const THEME_LOCAL_STORAGE_KEY = "blueprint-docs-theme";

// detect Components page and subheadings
const COMPONENTS_PATTERN = /\/components(\.\w+)?$/;

/** Return the current theme className. */
export function getTheme(): string {
    return localStorage.getItem(THEME_LOCAL_STORAGE_KEY) || LIGHT_THEME;
}

/** Persist the current theme className in local storage. */
export function setTheme(themeName: string) {
    localStorage.setItem(THEME_LOCAL_STORAGE_KEY, themeName);
}

export interface IBlueprintDocsProps extends Pick<IDocumentationProps, "defaultPageId" | "docs" | "tagRenderers"> {
    releases: IPackageInfo[];
    versions: IPackageInfo[];
}

export class BlueprintDocs extends React.Component<IBlueprintDocsProps, { themeName: string }> {
    public state = { themeName: getTheme() };

    public render() {
        const banner = (
            <Banner href="http://blueprintjs.com/docs/v2/">
                This documentation is for&nbsp;<strong>Blueprint v3.0.0</strong>, which is currently under development.
                Click here to go to the v2.x docs.
            </Banner>
        );
        const footer = (
            <small className={classNames("docs-copyright", Classes.TEXT_MUTED)}>
                &copy; {new Date().getFullYear()}
                <svg className={Classes.ICON} viewBox="0 0 18 23" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.718 16.653L9 20.013l-7.718-3.36L0 19.133 9 23l9-3.868-1.282-2.48zM9 14.738c-3.297 0-5.97-2.696-5.97-6.02C3.03 5.39 5.703 2.695 9 2.695c3.297 0 5.97 2.696 5.97 6.02 0 3.326-2.673 6.022-5.97 6.022zM9 0C4.23 0 .366 3.9.366 8.708c0 4.81 3.865 8.71 8.634 8.71 4.77 0 8.635-3.9 8.635-8.71C17.635 3.898 13.77 0 9 0z" />
                </svg>
                <a href="https://www.palantir.com/" target="_blank">
                    Palantir
                </a>
            </small>
        );
        const header = (
            <NavHeader
                onToggleDark={this.handleToggleDark}
                useDarkTheme={this.state.themeName === DARK_THEME}
                versions={this.props.versions}
            />
        );
        return (
            <Documentation
                {...this.props}
                banner={banner}
                className={this.state.themeName}
                footer={footer}
                header={header}
                onComponentUpdate={this.handleComponentUpdate}
                renderNavMenuItem={this.renderNavMenuItem}
                renderViewSourceLinkText={this.renderViewSourceLinkText}
            />
        );
    }

    private renderNavMenuItem = (props: INavMenuItemProps) => {
        const { route, title } = props.section;
        if (isPageNode(props.section) && props.section.level === 1) {
            const pkg = this.props.releases.find(p => p.name === `@blueprintjs/${route}`);
            return (
                <div className={classNames("docs-nav-package", props.className)} data-route={route}>
                    <a className={Classes.MENU_ITEM} href={props.href} onClick={props.onClick}>
                        <NavIcon route={route} />
                        <span>{title}</span>
                    </a>
                    {pkg && (
                        <a className={Classes.TEXT_MUTED} href={pkg.url} target="_blank">
                            <small>{pkg.version}</small>
                        </a>
                    )}
                </div>
            );
        }
        if (COMPONENTS_PATTERN.test(route)) {
            // non-interactive header that expands its menu
            return <div className="docs-nav-section docs-nav-expanded">{title}</div>;
        }
        return <NavMenuItem {...props} />;
    };

    private renderViewSourceLinkText(entry: ITsDocBase) {
        return `@blueprintjs/${entry.fileName.split("/", 2)[1]}`;
    }

    // This function is called whenever the documentation page changes and should be used to
    // run non-React code on the newly rendered sections.
    private handleComponentUpdate = () => {
        // indeterminate checkbox styles must be applied via JavaScript.
        Array.from(document.querySelectorAll(`.${Classes.CHECKBOX} input[indeterminate]`)).forEach(
            (el: HTMLInputElement) => (el.indeterminate = true),
        );
    };

    private handleToggleDark = (useDark: boolean) => {
        const nextThemeName = useDark ? DARK_THEME : LIGHT_THEME;
        setTheme(nextThemeName);
        setHotkeysDialogProps({ className: nextThemeName });
        this.setState({ themeName: nextThemeName });
    };
}
