import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import {
  ListItemIcon,
  ListItem,
  List,
  styled,
  ListItemText,
  Chip,
  useTheme,
  Typography,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import React from 'react';

const NavItem = ({ item, level, pathDirect, onClick, hideMenu }) => {
  const customizer = useSelector((state) => state.customizer);
  const Icon = item.icon;
  const theme = useTheme();
  const { t } = useTranslation();

  const itemIcon =
    level > 1 ? <Icon stroke={1.5} size="1rem" /> : <Icon stroke={1.5} size="1.3rem" />;

  const ListItemStyled = styled(ListItem)(({ theme }) => ({
    whiteSpace: 'nowrap',
    marginBottom: '2px',
    padding: '8px 10px',
    borderRadius: `${customizer.borderRadius}px`,
    backgroundColor: level > 1 ? 'transparent !important' : 'inherit',
    color:
      level > 1 && pathDirect === item.href
        ? `${theme.palette.primary.main}!important`
        : theme.palette.text.secondary,
    paddingLeft: hideMenu ? '10px' : level > 2 ? `${level * 15}px` : '10px',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    cursor: item.href ? 'pointer' : 'default',
    '&:hover': {
      backgroundColor: item.href ? theme.palette.primary.light : 'inherit',
      color: item.href ? theme.palette.primary.main : 'inherit',
    },
    '&.Mui-selected': item.href
      ? {
          color: 'white',
          backgroundColor: theme.palette.primary.main,
          paddingTop: '8px',
          paddingBottom: '8px',
          '&:hover': {
            backgroundColor: theme.palette.primary.main,
            color: 'white',
          },
        }
      : {},
  }));

  const CustomNavLink = React.forwardRef(({ className, ...props }, ref) => (
    <NavLink
      ref={ref}
      {...props}
      end
      className={({ isActive }) =>
        `${className ?? ''} ${isActive && item.href ? 'Mui-selected' : ''}`
      }
    />
  ));
  CustomNavLink.displayName = 'CustomNavLink';

  const hasRoute = item.href && item.href !== '#';

  return (
    <List component="li" disablePadding key={item.id}>
      <ListItemStyled
        component={
          item.external
            ? 'a'
            : hasRoute
            ? CustomNavLink
            : 'div'
        }
        to={item.external || !hasRoute ? undefined : item.href}
        href={item.external ? item.href : undefined}
        disabled={item.disabled}
        target={item.external ? '_blank' : ''}
        onClick={onClick}
      >
        <ListItemIcon
          sx={{
            minWidth: '36px',
            p: '3px 0',
            color:
              level > 1 && pathDirect === item.href
                ? `${theme.palette.primary.main}!important`
                : 'inherit',
          }}
        >
          {itemIcon}
        </ListItemIcon>

        <ListItemText>
          {hideMenu ? '' : <>{t(`${item.title}`)}</>}
          <br />
          {item.subtitle ? (
            <Typography variant="caption">{hideMenu ? '' : item.subtitle}</Typography>
          ) : (
            ''
          )}
        </ListItemText>

        {!item.chip || hideMenu ? null : (
          <Chip
            color={item.chipColor}
            variant={item.variant || 'filled'}
            size="small"
            label={item.chip}
          />
        )}
      </ListItemStyled>
    </List>
  );
};

NavItem.propTypes = {
  item: PropTypes.object,
  level: PropTypes.number,
  pathDirect: PropTypes.any,
  hideMenu: PropTypes.any,
  onClick: PropTypes.func,
};

export default NavItem;
