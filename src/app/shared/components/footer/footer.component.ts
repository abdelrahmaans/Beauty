import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Trust Features Banner -->
    <section class="trust-banner">
      <div class="container-custom">
        <div class="trust-grid">
          <div class="trust-item">
            <div class="trust-icon"><i class="fa-solid fa-certificate"></i></div>
            <div class="trust-text">
              <h4>منتجات أصلية 100%</h4>
              <p>نضمن جودة ومصدر جميع المنتجات من الموزعين المعتمدين</p>
            </div>
          </div>
          <div class="trust-item">
            <div class="trust-icon"><i class="fa-solid fa-truck-fast"></i></div>
            <div class="trust-text">
              <h4>توصيل سريع لباب بيتك</h4>
              <p>شحن لجميع محافظات مصر خلال 24 - 48 ساعة</p>
            </div>
          </div>
          <div class="trust-item">
            <div class="trust-icon"><i class="fa-solid fa-gem"></i></div>
            <div class="trust-text">
              <h4>برنامج مكافآت ونقاط ولاء</h4>
              <p>اجمعي نقاط مع كل طلب وحوليها لخصومات وهدايا مجانية</p>
            </div>
          </div>
          <div class="trust-item">
            <div class="trust-icon"><i class="fa-solid fa-hand-holding-dollar"></i></div>
            <div class="trust-text">
              <h4>دفع عند الاستلام</h4>
              <p>خيارات دفع مرنة وآمنة نقداً أو بالبطاقة أو المحافظ الإلكترونية</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Footer -->
    <footer class="main-footer">
      <div class="container-custom">
        <div class="footer-grid">
          <!-- Col 1: Brand Info -->
          <div class="footer-col brand-col">
            <div class="brand-logo">
              <div class="logo-symbol"><i class="fa-solid fa-feather-pointed"></i></div>
              <span class="brand-title">BEAUTY</span>
            </div>
            <p class="brand-desc">
              منصتك الأولى المتكاملة للعناية الفاخرة بالشعر والبشرة. نوفر أفضل الماركات والتركيبات العلاجية لتجربة عناية استثنائية من منزلك.
            </p>
            <div class="social-links">
              <a href="#" class="social-icon" title="Instagram"><i class="fa-brands fa-instagram"></i></a>
              <a href="#" class="social-icon" title="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
              <a href="#" class="social-icon" title="TikTok"><i class="fa-brands fa-tiktok"></i></a>
              <a href="#" class="social-icon" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
            </div>
          </div>

          <!-- Col 2: Categories -->
          <div class="footer-col">
            <h4 class="col-title">أقسام العناية</h4>
            <ul class="col-links">
              <li><a routerLink="/products" [queryParams]="{category: 'hair-care'}">العناية بالشعر والترميم</a></li>
              <li><a routerLink="/products" [queryParams]="{category: 'skin-care'}">سيرومات وغسول البشرة</a></li>
              <li><a routerLink="/products" [queryParams]="{category: 'moisturizers-sunscreen'}">الترطيب والحماية من الشمس</a></li>
              <li><a routerLink="/products" [queryParams]="{category: 'treatments-sets'}">المجموعات والعلاجات المكثفة</a></li>
            </ul>
          </div>

          <!-- Col 3: Customer Service -->
          <div class="footer-col">
            <h4 class="col-title">خدمة العملاء</h4>
            <ul class="col-links">
              <li><a routerLink="/account">تتبع الطلبات والحساب</a></li>
              <li><a href="javascript:void(0)">سياسة الاستبدال والاسترجاع</a></li>
              <li><a href="javascript:void(0)">الأسئلة الشائعة</a></li>
              <li><a href="javascript:void(0)">الشروط والأحكام</a></li>
            </ul>
          </div>

          <!-- Col 4: Newsletter -->
          <div class="footer-col">
            <h4 class="col-title">انضمي لنادي الجمال</h4>
            <p class="newsletter-text">اشتركي للحصول على خصومات حصرية، نصائح عناية مجانية، وأحدث الإصدارات.</p>
            <div class="newsletter-form">
              <input type="email" placeholder="أدخلي بريدك الإلكتروني" class="newsletter-input" />
              <button class="btn-primary newsletter-btn">اشتراك</button>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© 2026 جميع الحقوق محفوظة — منصة BEAUTY للعناية بالشعر والبشرة.</p>
          <div class="payment-methods">
            <span><i class="fa-solid fa-money-bill-wave"></i> كاش</span>
            <span><i class="fa-brands fa-cc-visa"></i> Visa</span>
            <span><i class="fa-brands fa-cc-mastercard"></i> MasterCard</span>
            <span><i class="fa-solid fa-mobile-screen-button"></i> محفظة</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .trust-banner {
      background: #FFFFFF;
      border-top: 1px solid var(--color-border-light);
      border-bottom: 1px solid var(--color-border-light);
      padding: 2.5rem 0;
    }
    .trust-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 2rem;
    }
    .trust-item {
      display: flex;
      align-items: center;
      gap: 1.15rem;
    }
    .trust-icon {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: var(--color-primary-light);
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      flex-shrink: 0;
    }
    .trust-text {
      h4 {
        font-size: 0.95rem;
        font-weight: 700;
        margin-bottom: 0.2rem;
      }
      p {
        font-size: 0.8rem;
        color: var(--color-text-muted);
        line-height: 1.4;
      }
    }

    .main-footer {
      background: #181513;
      color: #E6DFD9;
      padding-top: 4rem;
      padding-bottom: 2rem;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
      gap: 3rem;
      margin-bottom: 3.5rem;

      @media (max-width: 900px) {
        grid-template-columns: 1fr 1fr;
      }
      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .logo-symbol {
      width: 38px;
      height: 38px;
      background: var(--color-primary);
      color: #fff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
    .brand-title {
      font-family: var(--font-latin);
      font-weight: 800;
      font-size: 1.4rem;
      color: #FFFFFF;
      letter-spacing: 2px;
    }
    .brand-desc {
      font-size: 0.88rem;
      color: #AFA69E;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    .social-links {
      display: flex;
      gap: 0.75rem;
    }
    .social-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #282420;
      color: #D9D0C7;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      transition: var(--transition-smooth);

      &:hover {
        background: var(--color-primary);
        color: #fff;
        transform: translateY(-2px);
      }
    }
    .col-title {
      color: #FFFFFF;
      font-size: 1.05rem;
      font-weight: 700;
      margin-bottom: 1.25rem;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: -6px;
        right: 0;
        width: 28px;
        height: 2px;
        background: var(--color-primary);
        border-radius: 2px;
      }
    }
    .col-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      a {
        color: #B5ACA4;
        text-decoration: none;
        font-size: 0.9rem;
        transition: var(--transition-smooth);

        &:hover {
          color: var(--color-primary);
          padding-right: 4px;
        }
      }
    }
    .newsletter-text {
      font-size: 0.85rem;
      color: #AFA69E;
      margin-bottom: 1rem;
    }
    .newsletter-form {
      display: flex;
      gap: 0.5rem;
    }
    .newsletter-input {
      flex: 1;
      padding: 0.65rem 1rem;
      background: #282420;
      border: 1px solid #3D3732;
      border-radius: 9999px;
      color: #fff;
      font-family: inherit;
      font-size: 0.85rem;
      outline: none;

      &:focus {
        border-color: var(--color-primary);
      }
    }
    .newsletter-btn {
      padding: 0.65rem 1.25rem;
      font-size: 0.85rem;
    }
    .footer-bottom {
      border-top: 1px solid #282420;
      padding-top: 1.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      font-size: 0.82rem;
      color: #8C847D;
    }
    .payment-methods {
      display: flex;
      align-items: center;
      gap: 1rem;
      color: #B5ACA4;
    }
  `]
})
export class FooterComponent {}
