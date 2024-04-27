import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { permissionGuard } from 'src/app/permission.guard';
import { News } from 'src/app/news/news.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminNewsService } from '../admin-news.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-news-list',
  templateUrl: './admin-news-list.component.html',
  styleUrls: ['./admin-news-list.component.css']
})
export class AdminNewsListComponent {
  /** News List */
  public news$: Observable<News[]>;

  public displayedColumns: string[] = ['headline'];

  /** Route information to be used in Admin Routing Module */
  public static Route = {
    path: 'news',
    component: AdminNewsListComponent,
    title: 'News Administration',
    canActivate: [permissionGuard('news.list', 'news')]
  };

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private adminNewsService: AdminNewsService
  ) {
    this.news$ = adminNewsService.news$;
    adminNewsService.list();
  }

  /** Event handler to open the Organization Editor to create a new organization */
  createNews(): void {
    // Navigate to the org editor for a new organization (slug = create)
    this.router.navigate(['news', 'edit', 'new']);
  }
  editNews(news: News): void {
    this.router.navigate(['news', 'edit', news.slug]);
  }
  deleteNews(news: News): void {
    let confirmDelete = this.snackBar.open(
      'Are you sure you want to delete this news post?',
      'Delete',
      { duration: 15000 }
    );
    confirmDelete.onAction().subscribe(() => {
      this.adminNewsService.deleteNews(news).subscribe(() => {
        this.snackBar.open('This news post has been deleted.', '', {
          duration: 2000
        });
      });
    });
  }
}
