import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Profile, PublicProfile } from '../../profile/profile.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Organization } from 'src/app/organization/organization.model';
import { OrganizationService } from 'src/app/organization/organization.service';
import { Observable } from 'rxjs';
import { NewsService } from '../news.service';
import { News, State } from '../news.model';
import { profileResolver } from '../../profile/profile.resolver';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-news-editor',
  templateUrl: './news-editor.component.html',
  styleUrls: ['./news-editor.component.css']
})
export class NewsEditorComponent {
  public static Route = {
    path: 'news/edit/:slug',
    title: 'News Editor',
    component: NewsEditorComponent,
    resolve: {
      profile: profileResolver
    }
  };

  public profile: Profile | null = null;

  /** Form controls (individual form items) */
  headline = new FormControl('', [Validators.required]);
  sypnosis = new FormControl('', [Validators.required]);
  main_story = new FormControl('', [Validators.required]);
  organization = new FormControl('');
  slug = new FormControl('', [
    Validators.required,
    Validators.pattern('^(?!new$)[a-z0-9-]+$')
  ]);
  image_url = new FormControl('');

  /** Form group (stores all form controls) */
  public newsForm = this.formBuilder.group({
    headline: this.headline,
    sypnosis: this.sypnosis,
    main_story: this.main_story,
    organization: this.organization,
    slug: this.slug,
    image_url: this.image_url
  });

  /** Stores the ID of the timer currently being edited. */
  current: string = '';
  /** Stores whether or not the timer is new. */
  isNew: boolean = false;
  organizations$: Observable<Organization[]>;
  organizations: Organization[] = [];

  constructor(
    //private productivityService: ProductivityService,
    private route: ActivatedRoute,
    protected formBuilder: FormBuilder,
    private router: Router,
    protected snackBar: MatSnackBar,
    private organizationService: OrganizationService,
    private newsService: NewsService,
    private datePipe: DatePipe
  ) {
    // Determine if the timer is new.
    const data = route.snapshot.data as {
      profile: Profile;
    };
    this.profile = data.profile;

    this.isNew = route.snapshot.params['slug'] == 'new';
    if (!this.isNew) {
      this.current = route.snapshot.params['slug'];
      newsService.getNews(this.current).subscribe((newsData) => {
        let organizationName = '';
        if (newsData.organization) {
          organizationName = newsData.organization.name;
        }
        this.newsForm.setValue({
          headline: newsData.headline,
          sypnosis: newsData.synopsis,
          main_story: newsData.main_story,
          organization: organizationName,
          slug: newsData.slug,
          image_url: newsData.image_url
        });
      });
    }

    this.organizations$ = organizationService.getOrganizations();
    this.organizations$.subscribe((o) => {
      for (let i = 0; i < o.length; i++) {
        this.organizations.push(o[i]);
      }
    });
  }

  onSubmitForm() {
    let date = new Date();
    let utc_date = new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    );
    let diff_in_hours =
      (Math.floor(utc_date.getTime() / 1000) -
        Math.floor(date.getTime() / 1000)) /
      (60 * 60);
    console.log(diff_in_hours);
    if (this.newsForm.valid) {
      let newsData: News = {
        id: null, // Assign null for new news items
        headline: this.headline.value!,
        synopsis: this.sypnosis.value!,
        main_story: this.main_story.value!,
        user_id: -1,
        user: null,
        organization_id: null,
        organization: null,
        //author: null, // No author provided in form
        //organization_id: 1, // No organization ID provided in form
        //organization: null, // Use the selected organization or null if not selected
        state: State.DRAFT, // Default state is DRAFT
        image_url: this.image_url.value, // Use the provided imageURL or null if not provided
        slug: this.slug.value!,
        pub_date: new Date(
          new Date().setHours(new Date().getHours() - diff_in_hours)
        ), // Use the current date for publishDate
        mod_date: new Date(
          new Date().setHours(new Date().getHours() - diff_in_hours)
        ) // Use the current date for modifiedDate
      };
      console.log(new Date());
      console.log(this.profile);
      if (this.profile != null) {
        newsData['user_id'] = this.profile.id!;
        newsData['user'] = this.profile;
      }

      /*
      this.organizations$.subscribe((organizations) => {
        for (let i = 0; i < organizations.length; i++) {
          if (organizations[i].name == this.organization.value) {
            newsData['organization_id'] = organizations[i]['id'];
            newsData['organization'] = organizations[i];
            break;
          }
        }
      });
*/

      for (let i = 0; i < this.organizations.length; i++) {
        console.log(this.organizations[i].name + ' ' + this.organization.value);
        if (this.organizations[i].name == this.organization.value) {
          newsData.organization_id = this.organizations[i].id;
          newsData.organization = this.organizations[i];
          break;
        }
      }

      console.log(newsData);
      //this.newsService.createNews(newsData).subscribe();

      const newsObservable = this.isNew
        ? this.newsService.createNews(newsData)
        : this.newsService.updateNews(newsData);

      newsObservable.subscribe(
        () => {
          const message = this.isNew
            ? 'News created successfully!'
            : 'News updated successfully!';
          this.snackBar.open(message, '', { duration: 2000 });
          this.router.navigate(['/news']);
        },
        (error) => {
          const errorMessage = this.isNew
            ? 'Error creating news: '
            : 'Error updating news: ';
          this.snackBar.open(errorMessage + error, '', { duration: 2000 });
        }
      );
    } else {
      this.snackBar.open('Please enter values in the form correctly.', '', {
        duration: 2000
      });
    }
  }
}
