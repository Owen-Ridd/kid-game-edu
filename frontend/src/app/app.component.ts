import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApiService } from './core/services/api.service';
import { Game } from './core/models/game.models';
import { SoundService } from './core/services/sound.service';

interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  radius: number;
  decay: number;
}

export interface Fruit {
  id: string;
  label: string;
  basketId: string;
  imageUrl?: string;
  leftPercent: number;
  topPercent: number;
  placed?: boolean;
}

export interface Basket {
  id: string;
  label: string;
  fruitId: string;
  imageUrl?: string;
  caption: string;
  handleColor: string;
  rimColor: string;
  bodyColor: string;
  textColor: string;
  correct: boolean;
  wrong: boolean;
  placedFruit?: Fruit | null;
  placedFruits?: Fruit[];
}

export interface FruitPreset {
  id: string;
  name: string;
  targetBucketId: string;
  icon: string;
}

export interface BuilderItem {
  id: string;
  name: string;
  targetBucketId: string;
  imageUrl: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, CdkDrag, CdkDropList, CdkDropListGroup],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('fireworksCanvas') fireworksCanvas?: ElementRef<HTMLCanvasElement>;
  private fireworksAnimId: number | null = null;
  private fireworksTimeoutId: any = null;
  private hasPlayedCompletionSound = false;
  private particles: FireworkParticle[] = [];

  // Gameplay signals
  readonly pin = signal('');
  readonly joined = signal(false);
  readonly pinError = signal('');
  readonly placed = signal<string[]>([]);
  readonly completed = signal(false);
  readonly warningMessage = signal('');

  // Admin signals
  readonly adminLoginOpen = signal(false);
  readonly adminError = signal('');
  readonly adminAuthenticated = signal(false);
  readonly adminNotice = signal('');
  readonly latestPin = signal('');
  readonly adminTab = signal<'games' | 'sessions'>('games');
  readonly editingGameId = signal<string | null>(null);

  adminUsername = '';
  adminPassword = '';
  gameTitle = 'Bài học an toàn Đá Khô';
  groupName = 'Lớp Khám Phá';
  selectedGameId = '';
  games: Game[] = [];
  sessions: import('./core/models/game.models').Session[] = [];

  readonly fruitPresets: FruitPreset[] = [
    { id: 'thuc-pham', name: 'Bảo quản thực phẩm', targetBucketId: 'basket-da-kho', icon: '1F966' },
    { id: 'kem', name: 'Bảo quản kem', targetBucketId: 'basket-da-kho', icon: '1F366' },
    { id: 'khoi', name: 'Tạo hiệu ứng khói', targetBucketId: 'basket-da-kho', icon: '1F4A8' },
    { id: 'vac-xin', name: 'Bảo quản vắc-xin', targetBucketId: 'basket-da-kho', icon: '1F489' },
    { id: 'khong-cham', name: 'Không chạm vào đá khô', targetBucketId: 'khong-thuoc-ro', icon: '26D4' },
    { id: 'khong-an', name: 'Không được ăn đá khô', targetBucketId: 'khong-thuoc-ro', icon: '1F6AB' },
  ];

  builderItems: BuilderItem[] = [
    { id: 'thuc-pham', name: 'Bảo quản thực phẩm', targetBucketId: 'basket-da-kho', imageUrl: '/images/bao-quan-thuc-pham.jpg' },
    { id: 'kem', name: 'Bảo quản kem', targetBucketId: 'basket-da-kho', imageUrl: '/images/bao-quan-kem.jpg' },
    { id: 'khoi', name: 'Tạo hiệu ứng khói', targetBucketId: 'basket-da-kho', imageUrl: '/images/tao-khoi-san-khau.jpg' },
    { id: 'vac-xin', name: 'Bảo quản vắc-xin', targetBucketId: 'basket-da-kho', imageUrl: '/images/bao-quan-vac-xin.jpg' },
    { id: 'khong-cham', name: 'Không chạm vào đá khô', targetBucketId: 'khong-thuoc-ro', imageUrl: '/images/khong-cham-vao.jpg' },
    { id: 'khong-an', name: 'Không được ăn đá khô', targetBucketId: 'khong-thuoc-ro', imageUrl: '/images/khong-duoc-an.jpg' },
  ];

  readonly treeDropListId = 'tree-drop-zone';

  readonly defaultFruitPositions = [
    { left: 16, top: 26 }, // Cành cao trái
    { left: 38, top: 20 }, // Cành đỉnh giữa trái
    { left: 62, top: 20 }, // Cành đỉnh giữa phải
    { left: 84, top: 26 }, // Cành cao phải
    { left: 28, top: 54 }, // Cành dưới trái
    { left: 72, top: 54 }, // Cành dưới phải
    { left: 50, top: 20 }, // Dự phòng
  ];

  readonly demoItems: Fruit[] = [
    {
      id: 'thuc-pham',
      label: 'Bảo quản thực phẩm',
      basketId: 'basket-da-kho',
      imageUrl: '/images/bao-quan-thuc-pham.jpg',
      leftPercent: 16,
      topPercent: 26
    },
    {
      id: 'kem',
      label: 'Bảo quản kem',
      basketId: 'basket-da-kho',
      imageUrl: '/images/bao-quan-kem.jpg',
      leftPercent: 38,
      topPercent: 20
    },
    {
      id: 'khoi',
      label: 'Tạo hiệu ứng khói',
      basketId: 'basket-da-kho',
      imageUrl: '/images/tao-khoi-san-khau.jpg',
      leftPercent: 62,
      topPercent: 20
    },
    {
      id: 'vac-xin',
      label: 'Bảo quản vắc-xin',
      basketId: 'basket-da-kho',
      imageUrl: '/images/bao-quan-vac-xin.jpg',
      leftPercent: 84,
      topPercent: 26
    },
    {
      id: 'khong-cham',
      label: 'Không chạm vào đá khô',
      basketId: 'khong-thuoc-ro',
      imageUrl: '/images/khong-cham-vao.jpg',
      leftPercent: 28,
      topPercent: 54
    },
    {
      id: 'khong-an',
      label: 'Không được ăn đá khô',
      basketId: 'khong-thuoc-ro',
      imageUrl: '/images/khong-duoc-an.jpg',
      leftPercent: 72,
      topPercent: 54
    },
  ];

  items: Fruit[] = [...this.demoItems];

  baskets: Basket[] = [
    {
      id: 'basket-da-kho',
      label: 'Thùng Đá Khô',
      fruitId: '',
      caption: 'Thùng Đá Khô ❄️',
      imageUrl: '/images/da-kho.png',
      handleColor: '#00838F',
      rimColor: '#80DEEA',
      bodyColor: '#00ACC1',
      textColor: '#FFFFFF',
      correct: false,
      wrong: false,
      placedFruit: null,
      placedFruits: [],
    },
  ];

  constructor(
    private readonly api: ApiService,
    readonly sound: SoundService
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('kid-game-edu-token');
    if (token) {
      this.adminAuthenticated.set(true);
      this.refreshAdmin();
    }
  }

  // =========================================================================
  // GAMEPLAY LOGIC (FIXED DRAG & DROP & DRY ICE EDUCATION)
  // =========================================================================

  playDryIceDemo(): void {
    this.pin.set('123456');
    this.pinError.set('');
    this.items = this.demoItems.map(item => ({ ...item, placed: false }));
    this.baskets = [
      {
        id: 'basket-da-kho',
        label: 'Thùng Đá Khô',
        fruitId: '',
        caption: 'Thùng Đá Khô ❄️',
        imageUrl: '/images/da-kho.png',
        handleColor: '#00838F',
        rimColor: '#80DEEA',
        bodyColor: '#00ACC1',
        textColor: '#FFFFFF',
        correct: false,
        wrong: false,
        placedFruit: null,
        placedFruits: [],
      }
    ];
    this.resetGame();
    this.joined.set(true);
  }

  joinSession(): void {
    const code = this.pin().trim();
    if (!code) {
      this.playDryIceDemo();
      return;
    }

    if (code === '123456') {
      this.playDryIceDemo();
      return;
    }

    this.pinError.set('');
    this.api.validatePin(code).subscribe({
      next: response => {
        this.loadGame(response.game);
        this.joined.set(true);
      },
      error: () => {
        // Fallback for demo so user is NEVER blocked
        this.playDryIceDemo();
      },
    });
  }

  leaveRoom(): void {
    this.joined.set(false);
    this.pin.set('');
    this.warningMessage.set('');
    this.resetGame();
  }

  resetGame(): void {
    this.stopFireworks();
    this.hasPlayedCompletionSound = false;
    this.placed.set([]);
    this.completed.set(false);
    this.warningMessage.set('');
    this.items.forEach(f => f.placed = false);
    this.baskets.forEach(b => {
      b.correct = false;
      b.wrong = false;
      b.placedFruit = null;
      b.placedFruits = [];
    });
    this.sound.playCorrect();
  }

  dropIntoBasket(basket: Basket, event: CdkDragDrop<Fruit>): void {
    const fruit = event.item.data as Fruit;
    if (!fruit) return;

    // Check if fruit belongs to this basket
    const isMatch = (fruit.basketId === basket.id) || (basket.fruitId === fruit.id);

    if (isMatch) {
      this.markCorrect(fruit, basket);
      this.sound.playCorrect();
      return;
    }

    // Wrong match (e.g. Danger signs "Do Not Touch" or "Do Not Eat")
    basket.wrong = true;
    this.sound.playWrong();
    event.item.reset();
    setTimeout(() => basket.wrong = false, 750);

    // Show educational danger warning toast
    if (fruit.id === 'khong-cham' || fruit.label?.toLowerCase().includes('chạm')) {
      this.warningMessage.set('⚠️ NGUY HIỂM: Tuyệt đối KHÔNG CHẠM TAY trực tiếp vào đá khô vì gây bỏng lạnh!');
    } else if (fruit.id === 'khong-an' || fruit.label?.toLowerCase().includes('ăn')) {
      this.warningMessage.set('⚠️ CẢNH BÁO: Tuyệt đối KHÔNG ĐƯỢC ĂN đá khô vì cực kỳ nguy hiểm!');
    } else {
      this.warningMessage.set('⚠️ Hình này không thuộc thùng đá khô đâu bé ơi!');
    }
    setTimeout(() => this.warningMessage.set(''), 4000);

    if (this.pin()) {
      this.api.recordMistake(this.pin()).subscribe({ error: () => undefined });
    }
  }

  private markCorrect(fruit: Fruit, basket: Basket): void {
    fruit.placed = true;
    if (!this.placed().includes(fruit.id)) {
      this.placed.update(items => [...items, fruit.id]);
    }

    basket.correct = true;
    if (!basket.placedFruits) {
      basket.placedFruits = [];
    }
    if (!basket.placedFruits.some(f => f.id === fruit.id)) {
      basket.placedFruits.push(fruit);
    }
    basket.placedFruit = fruit;
    setTimeout(() => basket.correct = false, 800);

    // Check win condition: all items designated for ANY basket must be placed
    const targetItems = this.items.filter(item => item.basketId && item.basketId !== 'khong-thuoc-ro');
    const allTargetsPlaced = targetItems.length > 0 && targetItems.every(item => this.placed().includes(item.id));

    if (allTargetsPlaced) {
      setTimeout(() => {
        this.completed.set(true);
        if (!this.hasPlayedCompletionSound) {
          this.hasPlayedCompletionSound = true;
          this.sound.playFireworks();
        }
        this.startFireworks();
      }, 350);
    }
  }

  startFireworks(): void {
    this.stopFireworks();
    const canvas = this.fireworksCanvas?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.particles = [];

    const colors = ['#22C55E', '#10B981', '#38BDF8', '#F59E0B', '#EF4444', '#EC4899', '#A855F7', '#FDE047', '#FFFFFF'];

    let burstsLaunched = 0;
    const launchInterval = setInterval(() => {
      if (!this.completed() || burstsLaunched >= 8) {
        clearInterval(launchInterval);
        return;
      }
      burstsLaunched++;
      const x = canvas.width * (0.15 + Math.random() * 0.7);
      const y = canvas.height * (0.15 + Math.random() * 0.45);
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.explodeFirework(x, y, color);
    }, 450);

    this.fireworksTimeoutId = launchInterval;

    // Trigger immediate bursts
    this.explodeFirework(canvas.width * 0.3, canvas.height * 0.26, '#22C55E');
    this.explodeFirework(canvas.width * 0.7, canvas.height * 0.28, '#38BDF8');

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.vy += 0.08;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.restore();
        }
      }

      if (this.completed() || this.particles.length > 0) {
        this.fireworksAnimId = requestAnimationFrame(animate);
      }
    };

    this.fireworksAnimId = requestAnimationFrame(animate);
  }

  private explodeFirework(x: number, y: number, baseColor: string): void {
    const particleCount = 45;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 6 + 2.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: Math.random() > 0.4 ? baseColor : '#FFFFFF',
        radius: Math.random() * 2.8 + 1.8,
        decay: Math.random() * 0.012 + 0.008,
      });
    }
  }

  stopFireworks(): void {
    if (this.fireworksAnimId) {
      cancelAnimationFrame(this.fireworksAnimId);
      this.fireworksAnimId = null;
    }
    if (this.fireworksTimeoutId) {
      clearInterval(this.fireworksTimeoutId);
      this.fireworksTimeoutId = null;
    }
    this.particles = [];
    const canvas = this.fireworksCanvas?.nativeElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  ngOnDestroy(): void {
    this.stopFireworks();
  }

  isPlaced(id: string): boolean {
    return this.placed().includes(id);
  }

  fruitPlaceholder(id: string): string {
    const emojis: Record<string, string> = {
      'thuc-pham': '🥦',
      'kem': '🍦',
      'khoi': '💨',
      'vac-xin': '💉',
      'khong-cham': '🖐️',
      'khong-an': '🚫',
      apple: '🍎',
      lemon: '🍋',
      lime: '🍋',
      orange: '🍊',
      strawberry: '🍓',
      banana: '🍌',
      watermelon: '🍉',
    };
    const emoji = emojis[id] ?? '❄️';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${emoji}</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  private loadGame(game: Game): void {
    this.items = game.items.map((item, index) => {
      const pos = this.defaultFruitPositions[index % this.defaultFruitPositions.length];
      return {
        id: item.id,
        label: item.id === 'thuc-pham' ? 'Bảo quản thực phẩm' :
               item.id === 'kem' ? 'Bảo quản kem' :
               item.id === 'khoi' ? 'Tạo hiệu ứng khói' :
               item.id === 'vac-xin' ? 'Bảo quản vắc-xin' :
               item.id === 'khong-cham' ? 'Không chạm vào' :
               item.id === 'khong-an' ? 'Không được ăn' : item.id,
        basketId: item.targetBucketId,
        imageUrl: item.imageUrl,
        leftPercent: pos.left,
        topPercent: pos.top,
        placed: false,
      };
    });

    const basketColors: Record<string, { handle: string; rim: string; body: string; text: string; caption: string }> = {
      'basket-da-kho': { handle: '#00838F', rim: '#80DEEA', body: '#00ACC1', text: '#FFFFFF', caption: 'Thùng Đá Khô ❄️' },
      'basket-red': { handle: '#B71C1C', rim: '#EF5350', body: '#E53935', text: '#FFFFFF', caption: 'Basket-Red' },
      'basket-yellow': { handle: '#E65100', rim: '#FFEE58', body: '#FDD835', text: '#7A4B00', caption: 'Basket-Yellow' },
      'basket-green': { handle: '#1B5E20', rim: '#66BB6A', body: '#43A047', text: '#FFFFFF', caption: 'Basket-Green' },
      'basket-orange': { handle: '#BF360C', rim: '#FFA726', body: '#FB8C00', text: '#FFFFFF', caption: 'Basket-Orange' },
    };

    this.baskets = game.buckets.map(bucket => {
      const isDaKho = bucket.id === 'basket-da-kho' || bucket.id.includes('da-kho');
      const color = basketColors[bucket.id] ?? (isDaKho ? basketColors['basket-da-kho'] : {
        handle: '#42586B', rim: '#90A4AE', body: '#78909C', text: '#FFFFFF', caption: bucket.id,
      });
      return {
        id: bucket.id,
        label: bucket.id,
        fruitId: this.items.find(item => item.basketId === bucket.id)?.id ?? '',
        caption: color.caption,
        handleColor: color.handle,
        rimColor: color.rim,
        bodyColor: color.body,
        textColor: color.text,
        imageUrl: bucket.imageUrl || (isDaKho ? '/images/da-kho.png' : ''),
        correct: false,
        wrong: false,
        placedFruit: null,
        placedFruits: [],
      };
    });

    this.placed.set([]);
    this.completed.set(false);
  }

  // =========================================================================
  // ADMIN AUTH & MANAGEMENT
  // =========================================================================

  loginAdmin(): void {
    this.adminError.set('');
    this.api.login({ username: this.adminUsername, password: this.adminPassword }).subscribe({
      next: response => {
        localStorage.setItem('kid-game-edu-token', response.token);
        this.adminAuthenticated.set(true);
        this.refreshAdmin();
        this.adminLoginOpen.set(false);
        this.adminUsername = '';
        this.adminPassword = '';
      },
      error: () => this.adminError.set('Username hoặc password chưa đúng.'),
    });
  }

  logoutAdmin(): void {
    localStorage.removeItem('kid-game-edu-token');
    this.adminAuthenticated.set(false);
  }

  refreshAdmin(): void {
    this.adminNotice.set('');
    this.api.getGames().subscribe({
      next: games => {
        this.games = games;
        if (!this.selectedGameId && games[0]?.id) this.selectedGameId = games[0].id;
      },
      error: err => {
        if (err.status === 401 || err.status === 403) {
          this.logoutAdmin();
          this.adminNotice.set('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else {
          this.adminNotice.set('Không thể tải danh sách bài tập. Vui lòng kiểm tra backend.');
        }
      },
    });
    this.api.getSessions().subscribe({
      next: sessions => this.sessions = sessions,
      error: err => {
        if (err.status === 401 || err.status === 403) {
          this.logoutAdmin();
          this.adminNotice.set('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else {
          this.adminNotice.set('Không thể tải danh sách phòng chơi. Vui lòng kiểm tra backend.');
        }
      },
    });
  }

  // =========================================================================
  // GAME BUILDER (CONFIG CRUD)
  // =========================================================================

  addBuilderItem(): void {
    const nextIdx = this.builderItems.length + 1;
    this.builderItems.push({
      id: `item-${nextIdx}`,
      name: `Quả ${nextIdx}`,
      targetBucketId: 'basket-red',
      imageUrl: '',
    });
  }

  removeBuilderItem(index: number): void {
    if (this.builderItems.length <= 1) {
      this.adminNotice.set('Bài tập cần tối thiểu 1 quả.');
      return;
    }
    this.builderItems.splice(index, 1);
  }

  selectPreset(index: number, event: Event): void {
    const selectElem = event.target as HTMLSelectElement;
    const presetId = selectElem.value;
    const preset = this.fruitPresets.find(p => p.id === presetId);
    if (!preset) return;

    this.builderItems[index].id = preset.id;
    this.builderItems[index].name = preset.name;
    this.builderItems[index].targetBucketId = preset.targetBucketId;
  }

  uploadBuilderImage(index: number, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.api.uploadImage(file).subscribe({
      next: result => {
        this.builderItems[index].imageUrl = result.url;
        this.adminNotice.set('Tải ảnh lên thành công.');
      },
      error: () => this.adminNotice.set('Lỗi tải ảnh. Vui lòng cấu hình Cloudinary trong backend.'),
    });
  }

  saveGame(): void {
    const title = this.gameTitle.trim() || 'Fruit garden';
    if (!this.builderItems.length) {
      this.adminNotice.set('Hãy thêm ít nhất 1 quả.');
      return;
    }

    // Deduplicate buckets
    const uniqueBucketIds = Array.from(new Set(this.builderItems.map(i => i.targetBucketId)));
    const buckets = uniqueBucketIds.map(id => ({ id, imageUrl: '' }));

    const gamePayload: Game = {
      title,
      status: 'PUBLISHED',
      buckets,
      items: this.builderItems.map(item => ({
        id: item.id.trim() || 'fruit',
        imageUrl: item.imageUrl,
        targetBucketId: item.targetBucketId
      })),
    };

    const editId = this.editingGameId();
    if (editId) {
      // Update existing game
      this.api.updateGame(editId, gamePayload).subscribe({
        next: updated => {
          this.games = this.games.map(g => g.id === editId ? updated : g);
          this.adminNotice.set(`Đã cập nhật bài tập "${updated.title}" thành công!`);
          this.cancelEdit();
        },
        error: () => this.adminNotice.set('Không thể cập nhật bài tập.'),
      });
    } else {
      // Create new game
      this.api.createGame(gamePayload).subscribe({
        next: created => {
          this.games = [created, ...this.games];
          this.selectedGameId = created.id ?? '';
          this.adminNotice.set(`Đã lưu bài tập mới "${created.title}" thành công!`);
          this.resetBuilder();
        },
        error: () => this.adminNotice.set('Không thể lưu bài tập mới.'),
      });
    }
  }

  startEditGame(game: Game): void {
    this.editingGameId.set(game.id ?? null);
    this.gameTitle = game.title;
    this.builderItems = game.items.map(item => ({
      id: item.id,
      name: item.id,
      targetBucketId: item.targetBucketId,
      imageUrl: item.imageUrl || '',
    }));
    this.adminTab.set('games');
    this.adminNotice.set(`Đang chỉnh sửa bài tập: "${game.title}"`);
  }

  cancelEdit(): void {
    this.editingGameId.set(null);
    this.resetBuilder();
  }

  deleteGame(gameId: string, event: Event): void {
    event.stopPropagation();
    if (!confirm('Bạn có chắc chắn muốn xóa bài tập này?')) return;

    this.api.deleteGame(gameId).subscribe({
      next: () => {
        this.games = this.games.filter(g => g.id !== gameId);
        if (this.selectedGameId === gameId) {
          this.selectedGameId = this.games[0]?.id ?? '';
        }
        this.adminNotice.set('Đã xóa bài tập thành công.');
      },
      error: () => this.adminNotice.set('Không thể xóa bài tập này.'),
    });
  }

  private resetBuilder(): void {
    this.gameTitle = 'Fruit garden';
    this.builderItems = [
      { id: 'apple', name: 'Quả táo', targetBucketId: 'basket-red', imageUrl: '' },
      { id: 'lemon', name: 'Chanh vàng', targetBucketId: 'basket-yellow', imageUrl: '' },
      { id: 'lime', name: 'Chanh xanh', targetBucketId: 'basket-green', imageUrl: '' },
      { id: 'orange', name: 'Quả cam', targetBucketId: 'basket-orange', imageUrl: '' },
    ];
  }

  // =========================================================================
  // SESSION CONTROLS
  // =========================================================================

  createSession(): void {
    if (!this.selectedGameId) {
      this.adminNotice.set('Vui lòng chọn 1 bài tập.');
      return;
    }
    this.api.createSession(this.selectedGameId, this.groupName.trim() || 'New group').subscribe({
      next: session => {
        this.sessions = [session, ...this.sessions];
        this.latestPin.set(session.pinCode);
        this.adminTab.set('sessions');
        this.adminNotice.set(`Đã mở phòng mới! Mã PIN: ${session.pinCode}`);
      },
      error: () => this.adminNotice.set('Không thể tạo phòng mới.'),
    });
  }

  deactivateSession(sessionId: string): void {
    this.api.deactivateSession(sessionId).subscribe({
      next: updated => {
        this.sessions = this.sessions.map(s => s.id === sessionId ? updated : s);
        this.adminNotice.set(`Đã đóng phòng "${updated.groupName}".`);
      },
      error: () => this.adminNotice.set('Không thể đóng phòng này.'),
    });
  }

  copyPin(pinCode: string): void {
    navigator.clipboard.writeText(pinCode).then(() => {
      this.adminNotice.set(`Đã sao chép mã PIN: ${pinCode}`);
      setTimeout(() => this.adminNotice.set(''), 3000);
    });
  }

  getGameTitle(gameId: any): string {
    if (!gameId) return 'Bài tập';
    const idStr = typeof gameId === 'object' && gameId?.timestamp ? String(gameId.timestamp) : String(gameId);
    const game = this.games.find(g => String(g.id) === idStr || (typeof g.id === 'object' && JSON.stringify(g.id) === JSON.stringify(gameId)));
    return game ? game.title : 'Fruit sorting';
  }
}
