import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LessonService } from '../../../services/lesson.service';
import { Lesson } from '../../../models/lesson.model';
import { AuthService } from '../../../services/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-lesson-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lesson-view.component.html',
  styles: [`
    .prose {
      color: #374151;
    }

    .prose h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-top: 2rem;
      margin-bottom: 1rem;
    }

    .prose p {
      margin-bottom: 1rem;
      line-height: 1.75;
    }

    .prose ul, .prose ol {
      margin-left: 1.5rem;
      margin-bottom: 1rem;
    }

    .prose li {
      margin-bottom: 0.5rem;
    }
  `],
})

export class LessonViewComponent implements OnInit {
  lesson: Lesson | null = null;
  loading = true;
  completing = false;
  isStudent = false;

  constructor(
    private route: ActivatedRoute,
    private lessonService: LessonService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.isStudent = user?.role === 'estudiante';

    const lessonId = this.route.snapshot.params['id'];
    this.loadLesson(lessonId);
  }

  loadLesson(id: string): void {
    this.lessonService.getLessonById(id).subscribe({
      next: (lesson) => {
        this.lesson = lesson;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.loading = false;
      }
    });
  }

  getSafeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  completeLesson(): void {
    if (!this.lesson) return;

    this.completing = true;

    this.lessonService.completeLesson(this.lesson.id).subscribe({
      next: () => {
        if (this.lesson) {
          this.lesson.completed = true;
          this.lesson.completed_at = new Date();
        }
        this.completing = false;
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error al completar lección');
        this.completing = false;
      }
    });
  }
}