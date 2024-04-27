import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, tap } from 'rxjs';
import { RxNews } from 'src/app/news/rx-news';
import { News } from 'src/app/news/news.model';

@Injectable({
  providedIn: 'root'
})
export class AdminNewsService {
  private news: RxNews = new RxNews();
  public news$: Observable<News[]> = this.news.value$;
  constructor(
    protected http: HttpClient,
    protected snackBar: MatSnackBar
  ) {}

  /** Returns all news entries from the backend database table using the backend HTTP get request.
   * @returns {Observable<News[]>}
   */
  list(): void {
    this.http.get<News[]>('/api/news').subscribe((news) => this.news.set(news));
  }
  getAllNews(): Observable<News[]> {
    return this.http.get<News[]>('/api/news');
  }

  /** Returns the news object from the backend database table using the backend HTTP get request.
   * @param slug: String representing the news slug
   * @returns {Observable<News>}
   */
  getNews(slug: string): Observable<News> {
    return this.http.get<News>('/api/news/' + slug);
  }

  /** Returns the new news object from the backend database table using the backend HTTP post request.
   * @param news: NewsSummary representing the new organization
   * @returns {Observable<News>}
   */
  createNews(newNews: News): Observable<News> {
    return this.http
      .post<News>('/api/news', newNews)
      .pipe(tap((news) => this.news.pushNews(news)));
  }

  /** Returns the updated news object from the backend database table using the backend HTTP put request.
   * @param news: NewsSummary representing the updated organization
   * @returns {Observable<News>}
   */
  updateNews(news: News): Observable<News> {
    return this.http.put<News>('/api/news', news);
  }

  deleteNews(newsToRemove: News): Observable<News> {
    return this.http.delete<News>(`/api/news/${newsToRemove.slug}`).pipe(
      tap((_) => {
        this.news.removeNews(newsToRemove);
      })
    );
  }
}
