import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    priceFrom: '',
    priceTo: '',
    rooms: '',
    areaFrom: '',
    areaTo: ''
  });
  const [sortBy, setSortBy] = useState('date_desc');

  useEffect(() => {
    loadData();
    checkAuth();
    loadFavorites();
  }, []);

  const loadData = () => {
    const stored = localStorage.getItem('realty_properties');
    if (stored) {
      const all = JSON.parse(stored);
      setProperties(all.filter(p => p.status === 'approved'));
      setPendingProperties(all.filter(p => p.status === 'pending'));
    } else {
      const initial = [
        { 
          id: 1, 
          title: "Квартира в центре Москвы", 
          price: 12500000, 
          location: "Москва, ул. Тверская", 
          rooms: 2, 
          area: 65, 
          images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"], 
          description: "Просторная квартира в самом центре Москвы. Рядом метро, магазины, парки.",
          type: "Квартира", 
          status: "approved", 
          userId: 1,
          createdAt: new Date().toISOString()
        },
        { 
          id: 2, 
          title: "Загородный дом с участком", 
          price: 18500000, 
          location: "Московская обл., Одинцово", 
          rooms: 4, 
          area: 150, 
          images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400"], 
          description: "Красивый дом с участком 10 соток. Сад, баня, гараж.",
          type: "Дом", 
          status: "approved", 
          userId: 1,
          createdAt: new Date().toISOString()
        },
        { 
          id: 3, 
          title: "Студия в центре", 
          price: 8500000, 
          location: "Санкт-Петербург, Невский пр.", 
          rooms: 1, 
          area: 35, 
          images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"], 
          description: "Светлая студия рядом с метро.",
          type: "Квартира", 
          status: "approved", 
          userId: 1,
          createdAt: new Date().toISOString()
        }
      ];
      setProperties(initial);
      localStorage.setItem('realty_properties', JSON.stringify(initial));
    }
  };

  const checkAuth = () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  };

  const loadFavorites = () => {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  };

  const toggleFavorite = (propertyId) => {
    if (favorites.includes(propertyId)) {
      const newFavorites = favorites.filter(id => id !== propertyId);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } else {
      const newFavorites = [...favorites, propertyId];
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    }
  };

  const isFavorite = (propertyId) => favorites.includes(propertyId);

  const formatPrice = (price) => price.toLocaleString('ru-RU') + ' ₽';

  const handleLogin = (email, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...userData } = found;
      localStorage.setItem('currentUser', JSON.stringify(userData));
      setUser(userData);
      return true;
    }
    return false;
  };

  const handleRegister = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) return false;
    const newUser = { 
      id: Date.now(), 
      name, 
      email, 
      password, 
      role: 'user', 
      createdAt: new Date().toISOString() 
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setCurrentPage('home');
  };

  const becomeAdmin = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx].role = 'admin';
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify({...user, role: 'admin'}));
      setUser({...user, role: 'admin'});
      alert('Теперь вы администратор!');
    }
  };

  const approveProperty = (id) => {
    const all = JSON.parse(localStorage.getItem('realty_properties') || '[]');
    const index = all.findIndex(p => p.id === id);
    if (index !== -1) {
      all[index].status = 'approved';
      localStorage.setItem('realty_properties', JSON.stringify(all));
      loadData();
    }
  };

  const rejectProperty = (id) => {
    const all = JSON.parse(localStorage.getItem('realty_properties') || '[]');
    const index = all.findIndex(p => p.id === id);
    if (index !== -1) {
      all[index].status = 'rejected';
      localStorage.setItem('realty_properties', JSON.stringify(all));
      loadData();
    }
  };

  const getFilteredProperties = () => {
    let filtered = [...properties];
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search) || 
        p.location.toLowerCase().includes(search)
      );
    }
    if (filters.type) filtered = filtered.filter(p => p.type === filters.type);
    if (filters.priceFrom) filtered = filtered.filter(p => p.price >= parseInt(filters.priceFrom));
    if (filters.priceTo) filtered = filtered.filter(p => p.price <= parseInt(filters.priceTo));
    if (filters.rooms) {
      if (filters.rooms === '4') filtered = filtered.filter(p => p.rooms >= 4);
      else filtered = filtered.filter(p => p.rooms === parseInt(filters.rooms));
    }
    if (filters.areaFrom) filtered = filtered.filter(p => p.area >= parseInt(filters.areaFrom));
    if (filters.areaTo) filtered = filtered.filter(p => p.area <= parseInt(filters.areaTo));
    
    switch(sortBy) {
      case 'price_asc': filtered.sort((a, b) => a.price - b.price); break;
      case 'price_desc': filtered.sort((a, b) => b.price - a.price); break;
      case 'area_asc': filtered.sort((a, b) => a.area - b.area); break;
      case 'area_desc': filtered.sort((a, b) => b.area - a.area); break;
      default: filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return filtered;
  };

  // Компонент карточки услуги
  const ServiceCard = ({ icon, title, description, onLearnMore }) => (
    <div className="service-card" onClick={onLearnMore}>
      <div className="service-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button className="service-btn">Узнать больше →</button>
    </div>
  );

  // Компонент карточки недвижимости
  const PropertyCard = ({ property }) => (
    <div className="property-card" onClick={() => setCurrentPage('detail')}>
      <div className="property-image" style={{ backgroundImage: `url(${property.images[0]})` }}>
        <button 
          className={`favorite-btn ${isFavorite(property.id) ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleFavorite(property.id); }}
        >
          {isFavorite(property.id) ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="property-info">
        <div className="property-price">{formatPrice(property.price)}</div>
        <div className="property-title">{property.title}</div>
        <div className="property-location">📍 {property.location}</div>
        <div className="property-features">
          <span>{property.rooms} комн.</span>
          <span>{property.area} м²</span>
        </div>
      </div>
    </div>
  );

  // Главная страница
  const HomePage = () => {
    const services = [
      { icon: "🏢", title: "Аренда", description: "Сдаем и снимаем жилье быстро и выгодно" },
      { icon: "📊", title: "Оценка недвижимости", description: "Профессиональная оценка вашего имущества" },
      { icon: "🏠", title: "Покупка недвижимости", description: "Поможем найти идеальный вариант" },
      { icon: "💬", title: "Поддержка", description: "Круглосуточная поддержка клиентов" },
      { icon: "📞", title: "Консультации", description: "Бесплатные консультации экспертов" },
      { icon: "🔑", title: "Управление недвижимостью", description: "Полное сопровождение объектов" }
    ];

    return (
      <>
        {/* Hero секция */}
        <div className="hero">
          <div className="container">
            <h1>Недвижимость<span>Про</span></h1>
            <p>Профессиональный подход к каждому клиенту</p>
            <button className="hero-btn" onClick={() => setCurrentPage('catalog')}>Найти недвижимость →</button>
          </div>
        </div>

        {/* Услуги */}
        <div className="services-section">
          <div className="container">
            <h2 className="section-title">Наши услуги</h2>
            <div className="services-grid">
              {services.map((service, index) => (
                <ServiceCard 
                  key={index}
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  onLearnMore={() => alert(`Подробнее об услуге: ${service.title}`)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Популярные предложения */}
        <div className="popular-section">
          <div className="container">
            <h2 className="section-title">🔥 Популярные предложения</h2>
            <div className="properties-grid">
              {properties.slice(0, 3).map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </div>

        {/* Преимущества */}
        <div className="advantages-section">
          <div className="container">
            <div className="advantages-grid">
              <div className="advantage-item">
                <div className="advantage-icon">✓</div>
                <h3>Проверенные объекты</h3>
                <p>Каждый объект проходит тщательную проверку</p>
              </div>
              <div className="advantage-item">
                <div className="advantage-icon">🔒</div>
                <h3>Безопасные сделки</h3>
                <p>Юридическое сопровождение на всех этапах</p>
              </div>
              <div className="advantage-item">
                <div className="advantage-icon">⚡</div>
                <h3>Быстрая обработка</h3>
                <p>Заявки обрабатываются в течение 15 минут</p>
              </div>
              <div className="advantage-item">
                <div className="advantage-icon">👥</div>
                <h3>Опытные агенты</h3>
                <p>Более 10 лет на рынке недвижимости</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Каталог
  const CatalogPage = () => {
    const [showFilters, setShowFilters] = useState(false);
    const filtered = getFilteredProperties();
    
    return (
      <div className="catalog-page">
        <div className="container">
          <div className="catalog-header">
            <h1 className="catalog-title">Каталог недвижимости</h1>
            <div className="catalog-controls">
              <button className="filter-btn" onClick={() => setShowFilters(!showFilters)}>
                {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
              </button>
              <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="date_desc">Сначала новые</option>
                <option value="price_asc">По возрастанию цены</option>
                <option value="price_desc">По убыванию цены</option>
                <option value="area_asc">По возрастанию площади</option>
                <option value="area_desc">По убыванию площади</option>
              </select>
            </div>
          </div>
          
          {showFilters && (
            <div className="filters-panel">
              <div className="filters-grid">
                <div className="filter-group">
                  <label>Поиск</label>
                  <input type="text" placeholder="Введите адрес" value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} />
                </div>
                <div className="filter-group">
                  <label>Тип</label>
                  <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
                    <option value="">Все типы</option>
                    <option value="Квартира">Квартира</option>
                    <option value="Дом">Дом</option>
                    <option value="Коммерческая">Коммерческая</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Цена от</label>
                  <input type="number" placeholder="от ₽" value={filters.priceFrom} onChange={(e) => setFilters({...filters, priceFrom: e.target.value})} />
                </div>
                <div className="filter-group">
                  <label>Цена до</label>
                  <input type="number" placeholder="до ₽" value={filters.priceTo} onChange={(e) => setFilters({...filters, priceTo: e.target.value})} />
                </div>
                <div className="filter-group">
                  <label>Комнат</label>
                  <select value={filters.rooms} onChange={(e) => setFilters({...filters, rooms: e.target.value})}>
                    <option value="">Любое</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Площадь от</label>
                  <input type="number" placeholder="от м²" value={filters.areaFrom} onChange={(e) => setFilters({...filters, areaFrom: e.target.value})} />
                </div>
              </div>
              <button className="reset-filters" onClick={() => setFilters({search: '', type: '', priceFrom: '', priceTo: '', rooms: '', areaFrom: '', areaTo: ''})}>
                Сбросить все фильтры
              </button>
            </div>
          )}
          
          <div className="results-count">Найдено: {filtered.length} объектов</div>
          
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏠</div>
              <h3>Ничего не найдено</h3>
              <p>Попробуйте изменить параметры поиска</p>
            </div>
          ) : (
            <div className="properties-grid">
              {filtered.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Страница входа
  const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (isLogin) {
        if (handleLogin(email, password)) setCurrentPage('profile');
        else alert('Неверный email или пароль');
      } else {
        if (handleRegister(name, email, password)) {
          alert('Регистрация успешна! Теперь войдите');
          setIsLogin(true);
        } else alert('Пользователь с таким email уже существует');
      }
    };
    
    return (
      <div className="login-page">
        <div className="container">
          <div className="login-card">
            <div className="login-logo">Недвижимость<span>Про</span></div>
            <h2>{isLogin ? 'Вход в аккаунт' : 'Регистрация'}</h2>
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <input type="text" placeholder="Имя пользователя" className="login-input" value={name} onChange={(e) => setName(e.target.value)} required />
              )}
              <input type="email" placeholder="Email" className="login-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" placeholder="Пароль" className="login-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
              
              {isLogin && (
                <div className="login-options">
                  <label><input type="checkbox" /> Запомнить меня</label>
                  <a href="#" className="forgot-link">Забыли пароль?</a>
                </div>
              )}
              
              <button type="submit" className="login-btn">{isLogin ? 'Войти' : 'Зарегистрироваться'}</button>
            </form>
            
            <div className="login-footer">
              {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
              <button className="switch-btn" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Зарегистрироваться' : 'Войти'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Личный кабинет
  const ProfilePage = () => {
    const userProperties = properties.filter(p => p.userId === user?.id);
    
    if (!user) {
      return (
        <div className="container">
          <div className="empty-state">
            <h2>🔒 Войдите в систему</h2>
            <button className="service-btn" onClick={() => setCurrentPage('login')}>Войти</button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="profile-page">
        <div className="container">
          <div className="profile-container">
            <div className="profile-sidebar">
              <div className="profile-avatar">👤</div>
              <h3>{user.name || user.email}</h3>
              <p className="profile-email">{user.email}</p>
              <p className="profile-role">{user.role === 'admin' ? '👑 Администратор' : 'Пользователь'}</p>
              <p className="profile-date">Дата регистрации: {new Date(user.createdAt).toLocaleDateString()}</p>
              <hr />
              <p className="profile-stats">📊 {userProperties.length} объявлений</p>
              {user.role !== 'admin' && (
                <button className="service-btn" onClick={becomeAdmin}>Стать администратором</button>
              )}
              {user.role === 'admin' && (
                <button className="service-btn" onClick={() => setCurrentPage('admin')}>Перейти в админ-панель</button>
              )}
            </div>
            
            <div className="profile-content">
              <div className="profile-header">
                <h2>Мои объявления</h2>
                <button className="add-btn" onClick={() => alert('Форма добавления объявления')}>+ Добавить объявление</button>
              </div>
              
              {userProperties.length === 0 ? (
                <div className="empty-state-small">
                  <p>У вас пока нет объявлений</p>
                  <button className="service-btn" onClick={() => alert('Добавить объявление')}>Создать объявление</button>
                </div>
              ) : (
                <div className="properties-grid">
                  {userProperties.map(property => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Админ-панель
  const AdminPage = () => {
    if (!user || user.role !== 'admin') {
      return (
        <div className="container">
          <div className="empty-state">
            <h2>⛔ Доступ запрещён</h2>
            <p>У вас нет прав администратора</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="admin-page">
        <div className="container">
          <h1 className="page-title">📋 Модерация объявлений</h1>
          
          <div className="admin-grid">
            <div className="admin-column pending">
              <h3>⏳ На модерации ({pendingProperties.length})</h3>
              {pendingProperties.map(prop => (
                <div key={prop.id} className="admin-item">
                  <div className="admin-item-title">{prop.title}</div>
                  <div className="admin-item-details">{prop.location} • {prop.price.toLocaleString('ru-RU')} ₽</div>
                  <div className="admin-item-actions">
                    <button className="approve-btn" onClick={() => approveProperty(prop.id)}>✅ Одобрить</button>
                    <button className="reject-btn" onClick={() => rejectProperty(prop.id)}>❌ Отклонить</button>
                  </div>
                </div>
              ))}
              {pendingProperties.length === 0 && <div className="admin-empty">Нет объявлений на модерации</div>}
            </div>
            
            <div className="admin-column approved">
              <h3>✅ Одобренные ({properties.length})</h3>
              {properties.slice(0, 5).map(prop => (
                <div key={prop.id} className="admin-item">
                  <div className="admin-item-title">{prop.title}</div>
                  <div className="admin-item-details">{prop.price.toLocaleString('ru-RU')} ₽</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Детальная страница
  const DetailPage = () => {
    const [property, setProperty] = useState(null);
    const [mainImage, setMainImage] = useState('');
    
    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const id = parseInt(params.get('id'));
      const found = properties.find(p => p.id === id);
      if (found) {
        setProperty(found);
        setMainImage(found.images[0]);
      }
    }, []);
    
    if (!property) {
      return (
        <div className="container">
          <div className="empty-state">
            <div className="empty-icon">🏠</div>
            <h3>Объект не найден</h3>
          </div>
        </div>
      );
    }
    
    return (
      <div className="detail-page">
        <div className="container">
          <button className="back-btn" onClick={() => setCurrentPage('catalog')}>← Назад к каталогу</button>
          
          <div className="detail-card">
            <h1 className="detail-title">{property.title}</h1>
            <div className="detail-price">{formatPrice(property.price)}</div>
            
            <div className="detail-gallery">
              <img className="detail-main-image" src={mainImage} alt={property.title} />
              {property.images.length > 1 && (
                <div className="detail-thumbnails">
                  {property.images.map((img, idx) => (
                    <img key={idx} src={img} className={`detail-thumbnail ${mainImage === img ? 'active' : ''}`} onClick={() => setMainImage(img)} />
                  ))}
                </div>
              )}
            </div>
            
            <div className="detail-info">
              <div className="detail-info-grid">
                <div className="info-item"><div className="info-label">📍 Локация</div><div className="info-value">{property.location}</div></div>
                <div className="info-item"><div className="info-label">🛏️ Комнат</div><div className="info-value">{property.rooms === 0 ? 'Коммерческая' : property.rooms}</div></div>
                <div className="info-item"><div className="info-label">📐 Площадь</div><div className="info-value">{property.area} м²</div></div>
                <div className="info-item"><div className="info-label">🏠 Тип</div><div className="info-value">{property.type}</div></div>
              </div>
              
              {property.description && (
                <div className="detail-description">
                  <h3>Описание</h3>
                  <p>{property.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch(currentPage) {
      case 'home': return <HomePage />;
      case 'catalog': return <CatalogPage />;
      case 'admin': return <AdminPage />;
      case 'profile': return <ProfilePage />;
      case 'login': return <LoginPage />;
      case 'detail': return <DetailPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <div className="logo" onClick={() => setCurrentPage('home')}>
            Недвижимость<span>Про</span>
          </div>
          <nav className="nav">
            <button onClick={() => setCurrentPage('home')}>Главная</button>
            <button onClick={() => setCurrentPage('catalog')}>Каталог</button>
            {user?.role === 'admin' && <button onClick={() => setCurrentPage('admin')}>Админ</button>}
            <button onClick={() => setCurrentPage('favorites')}>Избранное</button>
            <button onClick={() => setCurrentPage('profile')}>
              {user ? (user.name || user.email) : 'Профиль'}
            </button>
            {!user && <button onClick={() => setCurrentPage('login')}>Вход</button>}
            {user && <button onClick={handleLogout}>Выйти</button>}
          </nav>
        </div>
      </header>
      
      <main>{renderContent()}</main>
      
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">Недвижимость<span>Про</span></div>
            <div className="footer-links">
              <div>
                <h4>О компании</h4>
                <a href="#">О нас</a>
                <a href="#">Вакансии</a>
                <a href="#">Контакты</a>
              </div>
              <div>
                <h4>Услуги</h4>
                <a href="#">Аренда</a>
                <a href="#">Продажа</a>
                <a href="#">Оценка</a>
              </div>
              <div>
                <h4>Помощь</h4>
                <a href="#">FAQ</a>
                <a href="#">Поддержка</a>
                <a href="#">Политика</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 НедвижимостьПро. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;