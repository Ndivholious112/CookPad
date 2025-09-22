import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecipeService } from '../../../services/recipe.service';
import { Recipe } from '../../../models/recipe.model';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, RecipeCardComponent],
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit, OnDestroy {
  recipes: Recipe[] = [];
  loading = true;
  error: string | null = null;
  search = '';
  sort: 'newest' | 'oldest' | 'likes' = 'newest';
  private searchInput$ = new Subject<string>();
  private currentSub?: Subscription;
  private searchSub?: Subscription;

  activeTab: 'all' | 'mine' | 'saved' = 'all';

  private loadingTimer?: any;
  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;

  constructor(private recipeService: RecipeService, public auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.searchSub = this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        this.search = term;
        this.loadRecipes();
      });
    this.loadRecipes();
  }

  loadRecipes() {
   
    if (this.currentSub) {
      this.currentSub.unsubscribe();
      this.currentSub = undefined;
    }
    this.loading = true;
   
    if (this.loadingTimer) clearTimeout(this.loadingTimer);
    this.loadingTimer = setTimeout(() => {
      this.loading = false;
      if (!this.error) this.error = 'Request took too long. Please try again.';
      this.cdr.markForCheck();
    }, 20000);
    this.error = null;

    let obs;
    if (this.activeTab === 'mine') {
      if (!this.auth.isAuthenticated()) {
        this.loading = false;
        this.recipes = [];
        this.error = 'Please log in to view your recipes.';
        return;
      }
      obs = this.recipeService.getMyRecipes();
    } else if (this.activeTab === 'saved') {
      if (!this.auth.isAuthenticated()) {
        this.loading = false;
        this.recipes = [];
        this.error = 'Please log in to view your saved recipes.';
        return;
      }
      obs = this.recipeService.getSavedRecipes();
    } else {
      const opts: any = {};
      if (this.search.trim()) opts.q = this.search.trim();
      opts.sort = this.sort;
      obs = this.recipeService.getRecipes(opts);
    }

    this.currentSub = obs.pipe(
      finalize(() => {
        this.loading = false;
        if (this.loadingTimer) {
          clearTimeout(this.loadingTimer);
          this.loadingTimer = undefined;
        }
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (data) => {
        this.recipes = data;
      },
      error: (err) => {
        this.error = 'Failed to load recipes. Please try again later.';
        console.error('Error loading recipes:', err);
      }
    });
  }

  onSearchChange(value: string) {
    this.searchInput$.next(value);
  }

  onSortChange(value: 'newest' | 'oldest' | 'likes') {
    this.sort = value;
    this.loadRecipes();
  }

  onTabChange(tab: 'all' | 'mine' | 'saved') {
    this.activeTab = tab;
    this.loadRecipes();
  }

  ngOnDestroy() {
    if (this.currentSub) this.currentSub.unsubscribe();
    if (this.searchSub) this.searchSub.unsubscribe();
  }

  clearSearch() {
    if (!this.search) return;
    this.search = '';
    this.loadRecipes();
  }


  @HostListener('document:keydown', ['$event'])
  onGlobalKeyDown(e: KeyboardEvent) {

    if (e.key === '/' && this.activeTab === 'all') {
      const target = e.target as HTMLElement;
      const isInputLike = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (!isInputLike) {
        e.preventDefault();
        this.searchInputRef?.nativeElement?.focus();
      }
    }

    if (e.key === 'Escape' && this.search) {
      this.clearSearch();
    }
  }
}
