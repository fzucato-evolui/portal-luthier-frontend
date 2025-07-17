import {Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {UserService} from '../services/user/user.service';
import {Subscription} from 'rxjs';
import {UtilFunctions} from '../util/util-functions';

export enum HierarchyComparison {
    EQUAL = '=',
    GREATER = '>',
    GREATER_EQUAL = '>=',
    LESS = '<',
    LESS_EQUAL = '<='
}

@Directive({
    selector: '[hasRole]',
    standalone: true
})
export class HasRoleDirective implements OnInit, OnDestroy {
    private subscription: Subscription;
    private requiredRole: string;
    private hasView = false;

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private userService: UserService
    ) {}

    @Input() set hasRole(role: string) {
        this.requiredRole = role;
        this.updateView();
    }

    ngOnInit() {
        this.subscription = this.userService.user$.subscribe(() => {
            this.updateView();
        });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private updateView() {
        const hasRole = this.userService.userHasRole(this.requiredRole);

        if (hasRole && !this.hasView) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.hasView = true;
        } else if (!hasRole && this.hasView) {
            this.viewContainer.clear();
            this.hasView = false;
        }
    }
}

@Directive({
    selector: '[hasHierarchyLevel]',
    standalone: true
})
export class HasHierarchyLevelDirective implements OnInit, OnDestroy {
    private subscription: Subscription;
    private requiredLevel: number;
    private comparison: HierarchyComparison = HierarchyComparison.GREATER_EQUAL; // default
    private hasView = false;

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private userService: UserService
    ) {}

    @Input() set hasHierarchyLevel(value: number | { level: number, comparison: HierarchyComparison }) {
        if (typeof value === 'number') {
            this.requiredLevel = value;
            this.comparison = HierarchyComparison.GREATER_EQUAL; // mantém o comportamento padrão
        } else {
            this.requiredLevel = value.level;
            this.comparison = value.comparison;
        }
        this.updateView();
    }

    ngOnInit() {
        this.subscription = this.userService.user$.subscribe(() => {
            this.updateView();
        });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private updateView() {
        const userLevel = this.userService.getUserHighestHierarchyLevel();
        let hasAccess = false;

        if (UtilFunctions.isValidStringOrArray(userLevel) === true) {
            if (UtilFunctions.isValidStringOrArray(this.requiredLevel) === false) {
                hasAccess = true;
            }
            else {
                switch (this.comparison) {
                    case HierarchyComparison.EQUAL:
                        hasAccess = userLevel === this.requiredLevel;
                        break;
                    case HierarchyComparison.GREATER:
                        hasAccess = userLevel < this.requiredLevel;
                        break;
                    case HierarchyComparison.GREATER_EQUAL:
                        hasAccess = userLevel <= this.requiredLevel;
                        break;
                    case HierarchyComparison.LESS:
                        hasAccess = userLevel > this.requiredLevel;
                        break;
                    case HierarchyComparison.LESS_EQUAL:
                        hasAccess = userLevel >= this.requiredLevel;
                        break;
                }
            }
        }

        if (hasAccess && !this.hasView) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.hasView = true;
        } else if (!hasAccess && this.hasView) {
            this.viewContainer.clear();
            this.hasView = false;
        }
    }
}

// Exportar todas as diretivas em um array para facilitar o uso
export const ROLE_DIRECTIVES = [
    HasRoleDirective,
    HasHierarchyLevelDirective
];
